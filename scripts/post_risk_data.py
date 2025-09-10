#!/usr/bin/env python3
"""
Post Risk Metrics sample data to Liferay Objects API
"""

import json
import requests
import base64
import os

# Liferay API configuration
LIFERAY_BASE_URL = "https://webserver-lctcreditagricole-prd.lfr.cloud"
RISK_API_ENDPOINT = "/o/c/riskmetricses/"

def get_auth_header():
    """Create Basic Auth header from environment secrets"""
    username = os.getenv('LIFERAY_USERNAME')
    password = os.getenv('LIFERAY_PASSWORD')
    
    if not username or not password:
        raise ValueError("LIFERAY_USERNAME and LIFERAY_PASSWORD environment variables required")
    
    credentials = f"{username}:{password}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded_credentials}"

def transform_risk_data(sample_risk):
    """Transform risk data from sample format to API format"""
    
    # Create unique external reference code from report date
    report_date = sample_risk["reportDate"]
    external_ref = f"RISK-{report_date}"
    
    # Transform data to match API format (no picklist mappings needed)
    api_data = {
        "externalReferenceCode": external_ref,
        "reportDate": sample_risk["reportDate"],
        "totalRiskExposure": sample_risk["totalRiskExposure"],
        "highRiskLoans": sample_risk["highRiskLoans"],
        "averageCreditScore": sample_risk["averageCreditScore"],
        "coverageRatio": sample_risk["coverageRatio"],
        "creditRiskPercentage": sample_risk["creditRiskPercentage"],
        "marketRiskPercentage": sample_risk["marketRiskPercentage"],
        "operationalRiskPercentage": sample_risk["operationalRiskPercentage"],
        "riskTrend": sample_risk["riskTrend"],
        "riskSummary": sample_risk["riskSummary"]
    }
    
    return api_data

def post_risk_to_api(risk_data):
    """Post a single risk metric to the Liferay API"""
    
    url = LIFERAY_BASE_URL + RISK_API_ENDPOINT
    
    headers = {
        "Authorization": get_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        response = requests.post(url, json=risk_data, headers=headers)
        
        print(f"Posting Risk Metric: {risk_data['reportDate']} (Trend: {risk_data['riskTrend']})")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print(f"✅ SUCCESS: {risk_data['reportDate']} risk metric created successfully")
            return True
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def main():
    """Main function to post all risk metrics sample data"""
    
    print("🚀 Starting Risk Metrics data upload to Liferay API...")
    print(f"Target: {LIFERAY_BASE_URL}{RISK_API_ENDPOINT}")
    print("-" * 60)
    
    # Load sample data
    try:
        with open("liferay-workspace/client-extensions/maestro-batch-objects/batch/maestro-risk-metrics-sample-data.json", "r") as f:
            sample_data = json.load(f)
    except FileNotFoundError:
        print("❌ ERROR: Sample data file not found")
        return
    except json.JSONDecodeError as e:
        print(f"❌ ERROR: Invalid JSON in sample data file: {e}")
        return
    
    risks = sample_data.get("items", [])
    print(f"Found {len(risks)} risk metrics to upload\n")
    
    success_count = 0
    
    # Post each risk metric
    for i, risk in enumerate(risks, 1):
        print(f"[{i}/{len(risks)}]", end=" ")
        
        # Transform data format
        api_data = transform_risk_data(risk)
        
        # Post to API
        if post_risk_to_api(api_data):
            success_count += 1
        
        print()  # Add spacing between entries
    
    print("-" * 60)
    print(f"📊 SUMMARY: {success_count}/{len(risks)} risk metrics uploaded successfully")
    
    if success_count == len(risks):
        print("🎉 All risk metrics uploaded successfully!")
    else:
        print(f"⚠️  {len(risks) - success_count} risk metrics failed to upload")

if __name__ == "__main__":
    main()