#!/usr/bin/env python3
"""
Post Maestro Loan sample data to Liferay Objects API
"""

import json
import requests
import base64
import os

# Liferay API configuration
LIFERAY_BASE_URL = "https://webserver-lctcreditagricole-prd.lfr.cloud"
LOAN_API_ENDPOINT = "/o/c/maestroloans/"

def get_auth_header():
    """Create Basic Auth header from environment secrets"""
    username = os.getenv('LIFERAY_USERNAME')
    password = os.getenv('LIFERAY_PASSWORD')
    
    if not username or not password:
        raise ValueError("LIFERAY_USERNAME and LIFERAY_PASSWORD environment variables required")
    
    credentials = f"{username}:{password}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded_credentials}"

def transform_loan_data(sample_loan):
    """Transform loan data from sample format to API format"""
    
    # Map sample data to actual Liferay LOAN_STATUS picklist keys
    status_mapping = {
        "application": "application",
        "under_review": "underreview",    # Fix: no underscore
        "approved": "approved",
        "active": "active", 
        "paid_off": "paidoff",            # Fix: no underscore
        "default": "default",
        "rejected": "rejected",
        "pending": "underreview"          # Map pending to underreview
    }
    
    # Get the correct picklist key
    sample_status = sample_loan.get("loanStatus", "application")
    liferay_status_key = status_mapping.get(sample_status, "application")
    
    # Transform data to match API format
    api_data = {
        "externalReferenceCode": sample_loan["loanId"],
        "loanId": sample_loan["loanId"],
        "clientName": sample_loan["clientName"],
        "loanAmount": sample_loan["loanAmount"],
        "currency": sample_loan["currency"],
        "loanType": sample_loan["loanType"],
        "loanStatus": liferay_status_key,
        "originationDate": sample_loan["originationDate"],
        "maturityDate": sample_loan["maturityDate"],
        "interestRate": sample_loan["interestRate"],
        "riskRating": sample_loan["riskRating"],
        "sector": sample_loan["sector"],
        "purpose": sample_loan["purpose"],
        "notes": sample_loan["notes"]
    }
    
    return api_data

def post_loan_to_api(loan_data):
    """Post a single loan to the Liferay API"""
    
    url = LIFERAY_BASE_URL + LOAN_API_ENDPOINT
    
    headers = {
        "Authorization": get_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        response = requests.post(url, json=loan_data, headers=headers)
        
        print(f"Posting loan: {loan_data['loanId']} ({loan_data['clientName']})")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print(f"✅ SUCCESS: {loan_data['loanId']} created successfully")
            return True
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def main():
    """Main function to post all loan sample data"""
    
    print("🚀 Starting Maestro Loan data upload to Liferay API...")
    print(f"Target: {LIFERAY_BASE_URL}{LOAN_API_ENDPOINT}")
    print("-" * 60)
    
    # Load sample data
    try:
        with open("liferay-workspace/client-extensions/maestro-batch-objects/batch/maestro-loans-sample-data.json", "r") as f:
            sample_data = json.load(f)
    except FileNotFoundError:
        print("❌ ERROR: Sample data file not found")
        return
    except json.JSONDecodeError as e:
        print(f"❌ ERROR: Invalid JSON in sample data file: {e}")
        return
    
    loans = sample_data.get("items", [])
    print(f"Found {len(loans)} loans to upload\n")
    
    success_count = 0
    
    # Post each loan
    for i, loan in enumerate(loans, 1):
        print(f"[{i}/{len(loans)}]", end=" ")
        
        # Transform data format
        api_data = transform_loan_data(loan)
        
        # Post to API
        if post_loan_to_api(api_data):
            success_count += 1
        
        print()  # Add spacing between entries
    
    print("-" * 60)
    print(f"📊 SUMMARY: {success_count}/{len(loans)} loans uploaded successfully")
    
    if success_count == len(loans):
        print("🎉 All loans uploaded successfully!")
    else:
        print(f"⚠️  {len(loans) - success_count} loans failed to upload")

if __name__ == "__main__":
    main()