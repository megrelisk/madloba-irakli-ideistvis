import os
import requests
import json
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

def load_env():
    if os.path.exists('.env'):
        with open('.env') as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value

load_env()
API_KEY = os.getenv('GOOGLE_API_KEY')

HEADERS = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': API_KEY,
    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types'
}

def check_company(name):
    print(f"Investigating: {name}")
    url = 'https://places.googleapis.com/v1/places:searchText'
    data = {"textQuery": f"{name} Tbilisi"}
    try:
        res = requests.post(url, headers=HEADERS, json=data).json()
        places = res.get('places', [])
        if not places:
            print(f"No results found for {name}")
        for p in places:
            p_name = p.get('displayName', {}).get('text')
            print(f"Found: {p_name}")
            print(f"Address: {p.get('formattedAddress')}")
            print(f"Types: {p.get('types')}")
            print("-" * 20)
    except Exception as e:
        print(f"Error checking {name}: {e}")

if __name__ == "__main__":
    check_company("Metrix")
    check_company("Renox")
    check_company("Metrix Construction")
    check_company("Renox Construction")
    check_company("მეტრიქსი")
    check_company("რინოქსი")
