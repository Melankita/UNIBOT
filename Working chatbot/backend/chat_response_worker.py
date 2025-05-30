import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TensorFlow warnings
import tensorflow as tf
import re
import time
import json
import faiss
import redis
import sqlite3
import requests
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from groq import Groq
from dotenv import load_dotenv
import random
import logging

# Configure logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

# Configuration
load_dotenv()
GROQ_API_KEY = os.getenv("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")
GOOGLE_API_KEY = os.getenv("AIzaSyBvYUmzASxOzphSFUsaTlCgu71iYhfCoLs")
GOOGLE_CX = os.getenv("2102a9afd28644dba")
MODEL_NAME = "llama-3.3-70b-versatile"
JSON_FILE_PATH = os.getenv("JSON_FILE_PATH", "E:\\chat\\structured_text_data.json")
CSV_FILE_PATH = os.getenv("CSV_FILE_PATH", "E:\\chat\\full_text_data.csv")
DB_FILE = os.getenv("DB_FILE", "E:\\chat\\queries.db")
USER_DB = os.getenv("USER_DB", "E:\\chat\\users.db")
FAQ_FILE_PATH = os.getenv("FAQ_FILE_PATH", "E:\\chat\\Working chatbot\\Working chatbot\\backend\\imp_questionss.json")

# Initialize Grok client
groq_client = Groq(api_key=GROQ_API_KEY)

# Load FAQ
try:
    with open(FAQ_FILE_PATH, "r", encoding="utf-8") as faq_file:
        faqs = json.load(faq_file)
except FileNotFoundError:
    faqs = []
faq_context = "\n".join([f"Q: {item['question']}\nA: {item['answer']}" for item in faqs])

# Embedding Model
embed_model = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")

# Database Setup
def init_main_db():
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_query TEXT NOT NULL,
                ai_response TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS feed (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_query TEXT NOT NULL,
                ai_response TEXT NOT NULL,
                user_feedback TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
    except sqlite3.Error as e:
        logger.error(f"Database initialization failed: {str(e)}")
    finally:
        conn.close()

def init_user_db():
    try:
        conn = sqlite3.connect(USER_DB)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone TEXT NOT NULL,
                password TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
    except sqlite3.Error as e:
        logger.error(f"User database initialization failed: {str(e)}")
    finally:
        conn.close()

init_main_db()
init_user_db()

# Redis
cache = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def get_cached_response(query):
    try:
        return cache.get(query)
    except redis.RedisError as e:
        logger.error(f"Redis error: {str(e)}")
        return None

def set_cached_response(query, response, expiry=3600):
    try:
        cache.set(query, response, ex=expiry)
    except redis.RedisError as e:
        logger.error(f"Redis error: {str(e)}")

# Helper Functions
def save_query_response(user_query, ai_response):
    try:
        with sqlite3.connect(DB_FILE) as conn:
            conn.execute("INSERT INTO chat_log (user_query, ai_response) VALUES (?, ?)", (user_query, ai_response))
            conn.commit()
    except sqlite3.Error as e:
        logger.error(f"Failed to save query: {str(e)}")

def save_user_credentials(phone, password):
    try:
        with sqlite3.connect(USER_DB) as conn:
            conn.execute("INSERT INTO users (phone, password) VALUES (?, ?)", (phone, password))
            conn.commit()
    except sqlite3.Error as e:
        logger.error(f"Failed to save user: {str(e)}")

def save_feedback(user_query, ai_response, user_feedback):
    try:
        with sqlite3.connect(DB_FILE) as conn:
            conn.execute("INSERT INTO feed (user_query, ai_response, user_feedback) VALUES (?, ?, ?)",
                         (user_query, ai_response, user_feedback))
            conn.commit()
    except sqlite3.Error as e:
        logger.error(f"Failed to save feedback: {str(e)}")

# Data Loading
def clean_text(text):
    text = re.sub(r"(home (current)|About Us|KMES Management.*?Policy)", "", text, flags=re.DOTALL)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def preprocess_query(query):
    return re.sub(r'[^\w\s]', '', query.lower().strip())

def load_json_and_process(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
        text_data, metadata = [], []

        def extract_text_recursive(obj, parent_key=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    if key.lower() == "extracted_text" and isinstance(value, str):
                        cleaned = clean_text(value)
                        if "work in progress" not in cleaned.lower() and len(cleaned) > 10:
                            text_data.append(cleaned)
                            metadata.append({"section": parent_key, "text": cleaned})
                    else:
                        extract_text_recursive(value, parent_key=key)
            elif isinstance(obj, list):
                for item in obj:
                    extract_text_recursive(item, parent_key)

        extract_text_recursive(data)
        return text_data, metadata
    except Exception as e:
        print(f"Error loading JSON: {str(e)}")
        return [], []

def load_csv_and_process(file_path):
    try:
        df = pd.read_csv(file_path, encoding="utf-8")
        text = " ".join(df.iloc[0].astype(str))
        return clean_text(text), {"section": "KMIT Website", "text": clean_text(text)}
    except Exception as e:
        print(f"Error loading CSV: {str(e)}")
        return None, None

json_texts, json_metadata = load_json_and_process(JSON_FILE_PATH)
csv_text, csv_metadata = load_csv_and_process(CSV_FILE_PATH)

all_texts = json_texts + ([csv_text] if csv_text else [])
all_metadata = json_metadata + ([csv_metadata] if csv_metadata else [])

# FAISS Indexing
embeds = embed_model.encode(all_texts, convert_to_numpy=True, normalize_embeddings=True)
faiss.normalize_L2(embeds)
faiss_index = faiss.IndexFlatIP(embeds.shape[1])
faiss_index.add(embeds)

# Web Search
def perform_web_search(query):
    search_url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "q": query,
        "key": GOOGLE_API_KEY,
        "cx": GOOGLE_CX,
        "num": 3
    }
    try:
        time.sleep(2)  # Basic rate limiting
        response = requests.get(search_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        results = []
        for item in data.get("items", []):
            title = item.get("title", "No Title")
            link = item.get("link", "#")
            snippet = item.get("snippet", "No snippet available.")
            results.append(f"**{title}**\n{snippet}\n🔗 [Link]({link})")
        return results if results else ["No relevant search results."]
    except requests.exceptions.RequestException as e:
        return [f"Search error: {str(e)}"]

# Retrieval & Response
def chat_with_bot(message: str, include_search: bool = False) -> str:
    cached = get_cached_response(message)
    if cached:
        return cached

    # Rule 1: Greeting
    lower_msg = message.lower().strip()
    intros = [
        "Hi there! I'm UniBot, your university assistant. How can I help you today?",
        "Hello! I'm here to assist you with KMIT-related queries.",
        "Greetings! Ask me anything about KMIT or your student life.",
    ]
    if lower_msg in ["hi", "hello", "hey", "hii", "hiii", "yo"]:
        return random.choice(intros)

    # Rule 2: Full form request
    if re.search(r"full\s*form\s*(of)?\s*kmit", lower_msg):
        ai_response = "KMIT stands for Keshav Memorial Institute of Technology, located in Narayanguda, Hyderabad."
        save_query_response(message, ai_response)
        set_cached_response(message, ai_response)
        return ai_response

    # Rule 3: Generic KMIT query
    if "kmit" in lower_msg:
        message += (
            "\n\n(When answering, note that 'KMIT' refers to Keshav Memorial Institute of Technology, located in Narayanguda, Hyderabad. Tailor responses accordingly.)"
        )

    dataset_context = retrieve_top_k(message, k=5)
    context_data = "\n".join([doc['text'][:1000] for doc in dataset_context])  # Truncate to avoid token limits
    
    web_context = ""
    if include_search:
        web_results = perform_web_search(message)
        if web_results and "No relevant search results." not in web_results[0]:
            web_context = "\n\nWeb context:\n" + "\n".join(web_results)[:2000]  # Truncate web context

    # Combine contexts (truncate to avoid token limit)
    full_context = f"""
Dataset context:
{context_data[:3000]}

{web_context}
FAQs:
{faq_context[:1000]}

Question: {message}
Answer:
"""

    try:
        chat_response = groq_client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": full_context}
            ]
        )
        ai_response = chat_response.choices[0].message.content.strip()
        save_query_response(message, ai_response)
        set_cached_response(message, ai_response)
        return ai_response
    except Exception as e:
        return f"Error generating response: {str(e)}"

def retrieve_top_k(query, k=7, threshold=0.5):
    if faiss_index.ntotal == 0:
        return [{"text": "No data available."}]
    query_embed = embed_model.encode([preprocess_query(query)], convert_to_numpy=True)
    faiss.normalize_L2(query_embed)
    distances, results = faiss_index.search(query_embed, k)
    return [all_metadata[i] for i, d in zip(results[0], distances[0]) if i < len(all_metadata) and d > threshold]