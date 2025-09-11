#!/usr/bin/env python3
"""
Post Maestro Deal sample data to Liferay Objects API
"""

import json
import requests
import base64
import os

# Liferay API configuration
LIFERAY_BASE_URL = "https://webserver-lctcreditagricole-prd.lfr.cloud"
DEAL_API_ENDPOINT = "/o/c/maestrodeals/"

def get_auth_header():
    """Create Basic Auth header from environment secrets"""
    username = os.getenv('LIFERAY_USERNAME')
    password = os.getenv('LIFERAY_PASSWORD')
    
    if not username or not password:
        raise ValueError("LIFERAY_USERNAME and LIFERAY_PASSWORD environment variables required")
    
    credentials = f"{username}:{password}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded_credentials}"

def transform_deal_data(sample_deal):
    """Transform deal data from sample format to API format"""
    
    # Map sample data to actual Liferay DEAL_STATUS picklist keys
    status_mapping = {
        "lead": "lead",
        "qualified": "qualified",
        "proposal": "proposal",
        "negotiation": "negotiation",
        "closed_won": "closedwon",        # Fix: no underscore
        "closed_lost": "closedlost",      # Fix: no underscore  
        "due_diligence": "qualified",     # Map due_diligence to qualified
        "approved": "closedwon",          # Map approved to closedwon
        "closed": "closedwon"             # Map closed to closedwon
    }
    
    # Map sample data to actual Liferay DEAL_PRIORITY picklist keys
    priority_mapping = {
        "low": "low",
        "medium": "medium",
        "high": "high",
        "critical": "critical"
    }
    
    # Get the correct picklist keys
    sample_status = sample_deal.get("dealStatus", "lead")
    sample_priority = sample_deal.get("priority", "medium")
    
    liferay_status_key = status_mapping.get(sample_status, "lead")
    liferay_priority_key = priority_mapping.get(sample_priority, "medium")
    
    # Transform data to match API format
    api_data = {
        "externalReferenceCode": sample_deal["dealId"],
        "dealId": sample_deal["dealId"],
        "dealName": sample_deal["dealName"],
        "clientName": sample_deal["clientName"],
        "dealValue": sample_deal["dealValue"],
        "currency": sample_deal["currency"],
        "dealStatus": liferay_status_key,
        "priority": liferay_priority_key,
        "expectedClosingDate": sample_deal["expectedClosingDate"],
        "lastUpdated": sample_deal["lastUpdated"],
        "dealType": sample_deal["dealType"],
        "sector": sample_deal["sector"],
        "relationshipManager": sample_deal["relationshipManager"],
        "description": sample_deal["description"]
    }
    
    return api_data

def post_deal_to_api(deal_data):
    """Post a single deal to the Liferay API"""
    
    url = LIFERAY_BASE_URL + DEAL_API_ENDPOINT
    
    headers = {
        "Authorization": get_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        response = requests.post(url, json=deal_data, headers=headers)
        
        print(f"Posting deal: {deal_data['dealId']} ({deal_data['dealName']})")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print(f"✅ SUCCESS: {deal_data['dealId']} created successfully")
            return True
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def main():
    """Main function to post all deal sample data"""
    
    print("🚀 Starting Maestro Deal data upload to Liferay API...")
    print(f"Target: {LIFERAY_BASE_URL}{DEAL_API_ENDPOINT}")
    print("-" * 60)
    
    # Load sample data
    try:
        with open("expanded_data/expanded-deals.json", "r") as f:
            sample_data = json.load(f)
    except FileNotFoundError:
        print("❌ ERROR: Sample data file not found")
        return
    except json.JSONDecodeError as e:
        print(f"❌ ERROR: Invalid JSON in sample data file: {e}")
        return
    
    deals = sample_data.get("items", [])
    print(f"Found {len(deals)} deals to upload\n")
    
    success_count = 0
    
    # Post each deal
    for i, deal in enumerate(deals, 1):
        print(f"[{i}/{len(deals)}]", end=" ")
        
        # Transform data format
        api_data = transform_deal_data(deal)
        
        # Post to API
        if post_deal_to_api(api_data):
            success_count += 1
        
        print()  # Add spacing between entries
    
    print("-" * 60)
    print(f"📊 SUMMARY: {success_count}/{len(deals)} deals uploaded successfully")
    
    if success_count == len(deals):
        print("🎉 All deals uploaded successfully!")
    else:
        print(f"⚠️  {len(deals) - success_count} deals failed to upload")

if __name__ == "__main__":
    main()