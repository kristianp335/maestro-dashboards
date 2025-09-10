#!/usr/bin/env python3
"""
Post Maestro Client sample data to Liferay Objects API
"""

import json
import requests
import base64
import os
from datetime import datetime

# Liferay API configuration
LIFERAY_BASE_URL = "https://webserver-lctcreditagricole-prd.lfr.cloud"
CLIENT_API_ENDPOINT = "/o/c/maestroclients/"

def get_auth_header():
    """Create Basic Auth header from environment secrets"""
    username = os.getenv('LIFERAY_USERNAME')
    password = os.getenv('LIFERAY_PASSWORD')
    
    if not username or not password:
        raise ValueError("LIFERAY_USERNAME and LIFERAY_PASSWORD environment variables required")
    
    # Encode credentials for Basic Auth
    credentials = f"{username}:{password}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    
    return f"Basic {encoded_credentials}"

def transform_client_data(sample_client):
    """Transform client data from sample format to API format"""
    
    # Map lowercase sample data to actual Liferay picklist keys
    status_mapping = {
        "active": "Active",
        "prospect": "Prospect", 
        "inactive": "Inactive",
        "under_review": "UnderReview",
        "suspended": "Suspended"
    }
    
    # Get the correct picklist key
    sample_status = sample_client.get("clientStatus", "active")
    liferay_status_key = status_mapping.get(sample_status, "Active")
    
    # Transform data to match API format
    api_data = {
        "externalReferenceCode": sample_client["clientId"],  # Use clientId as external reference
        "clientId": sample_client["clientId"],
        "clientName": sample_client["clientName"],
        "legalEntityType": sample_client["legalEntityType"],
        "country": sample_client["country"],
        "sector": sample_client["sector"],
        "creditRating": sample_client["creditRating"],
        "annualRevenue": sample_client["annualRevenue"],
        "relationshipStartDate": sample_client["relationshipStartDate"],
        "relationshipManager": sample_client["relationshipManager"],
        "clientStatus": liferay_status_key,  # Use correct Liferay picklist key
        "riskClassification": sample_client["riskClassification"],
        "clientNotes": sample_client["clientNotes"]
    }
    
    return api_data

def post_client_to_api(client_data):
    """Post a single client to the Liferay API"""
    
    url = LIFERAY_BASE_URL + CLIENT_API_ENDPOINT
    
    headers = {
        "Authorization": get_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        response = requests.post(url, json=client_data, headers=headers)
        
        print(f"Posting client: {client_data['clientName']}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print(f"✅ SUCCESS: {client_data['clientName']} created successfully")
            return True
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def main():
    """Main function to post all client sample data"""
    
    print("🚀 Starting Maestro Client data upload to Liferay API...")
    print(f"Target: {LIFERAY_BASE_URL}{CLIENT_API_ENDPOINT}")
    print("-" * 60)
    
    # Load sample data
    try:
        with open("liferay-workspace/client-extensions/maestro-batch-objects/batch/maestro-clients-sample-data.json", "r") as f:
            sample_data = json.load(f)
    except FileNotFoundError:
        print("❌ ERROR: Sample data file not found")
        return
    except json.JSONDecodeError as e:
        print(f"❌ ERROR: Invalid JSON in sample data file: {e}")
        return
    
    clients = sample_data.get("items", [])
    print(f"Found {len(clients)} clients to upload\n")
    
    success_count = 0
    
    # Post each client
    for i, client in enumerate(clients, 1):
        print(f"[{i}/{len(clients)}]", end=" ")
        
        # Transform data format
        api_data = transform_client_data(client)
        
        # Post to API
        if post_client_to_api(api_data):
            success_count += 1
        
        print()  # Add spacing between entries
    
    print("-" * 60)
    print(f"📊 SUMMARY: {success_count}/{len(clients)} clients uploaded successfully")
    
    if success_count == len(clients):
        print("🎉 All clients uploaded successfully!")
    else:
        print(f"⚠️  {len(clients) - success_count} clients failed to upload")

if __name__ == "__main__":
    main()