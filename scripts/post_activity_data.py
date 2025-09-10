#!/usr/bin/env python3
"""
Post GFD Activities sample data to Liferay Objects API
"""

import json
import requests
import base64
import os

# Liferay API configuration
LIFERAY_BASE_URL = "https://webserver-lctcreditagricole-prd.lfr.cloud"
ACTIVITY_API_ENDPOINT = "/o/c/gfdactivities/"

def get_auth_header():
    """Create Basic Auth header from environment secrets"""
    username = os.getenv('LIFERAY_USERNAME')
    password = os.getenv('LIFERAY_PASSWORD')
    
    if not username or not password:
        raise ValueError("LIFERAY_USERNAME and LIFERAY_PASSWORD environment variables required")
    
    credentials = f"{username}:{password}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded_credentials}"

def transform_activity_data(sample_activity):
    """Transform activity data from sample format to API format"""
    
    # Map sample data to actual Liferay ACTIVITY_STATUS picklist keys
    status_mapping = {
        "planned": "planned",
        "in_progress": "inprogress",      # Fix: no underscore
        "completed": "completed", 
        "cancelled": "cancelled",
        "on_hold": "onhold",              # Fix: no underscore
        "exception": "onhold"             # Map exception to onhold
    }
    
    # Map sample data to actual Liferay ACTIVITY_TYPE picklist keys  
    type_mapping = {
        "client_meeting": "clientmeeting",        # Fix: no underscore
        "phone_call": "phonecall",                # Fix: no underscore
        "document_review": "documentreview",      # Fix: no underscore
        "due_diligence": "duediligence",          # Fix: no underscore
        "risk_assessment": "riskassessment",      # Fix: no underscore
        "credit_analysis": "creditanalysis",      # Fix: no underscore
        "compliance_check": "compliancecheck",    # Fix: no underscore
        "credit": "creditanalysis",               # Map credit to creditanalysis
        "origination": "duediligence",            # Map origination to duediligence
        "distribution": "documentreview",         # Map distribution to documentreview
        "system": "compliancecheck"               # Map system to compliancecheck
    }
    
    # Get the correct picklist keys
    sample_status = sample_activity.get("activityStatus", "planned")
    sample_type = sample_activity.get("activityType", "document_review")
    
    liferay_status_key = status_mapping.get(sample_status, "planned")
    liferay_type_key = type_mapping.get(sample_type, "document_review")
    
    # Transform data to match API format
    api_data = {
        "externalReferenceCode": sample_activity["activityId"],
        "activityId": sample_activity["activityId"],
        "activityTitle": sample_activity["activityTitle"],
        "activityDescription": sample_activity["activityDescription"],
        "activityType": liferay_type_key,
        "activityStatus": liferay_status_key,
        "activityDate": sample_activity["activityDate"],
        "relatedEntityId": sample_activity.get("relatedEntityId"),
        "relatedEntityType": sample_activity["relatedEntityType"],
        "createdBy": sample_activity["createdBy"],
        "priority": sample_activity["priority"],
        "notes": sample_activity["notes"]
    }
    
    return api_data

def post_activity_to_api(activity_data):
    """Post a single activity to the Liferay API"""
    
    url = LIFERAY_BASE_URL + ACTIVITY_API_ENDPOINT
    
    headers = {
        "Authorization": get_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        response = requests.post(url, json=activity_data, headers=headers)
        
        print(f"Posting activity: {activity_data['activityId']} ({activity_data['activityTitle'][:50]}...)")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print(f"✅ SUCCESS: {activity_data['activityId']} created successfully")
            return True
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False

def main():
    """Main function to post all activity sample data"""
    
    print("🚀 Starting GFD Activities data upload to Liferay API...")
    print(f"Target: {LIFERAY_BASE_URL}{ACTIVITY_API_ENDPOINT}")
    print("-" * 60)
    
    # Load sample data
    try:
        with open("liferay-workspace/client-extensions/maestro-batch-objects/batch/maestro-gfd-activities-sample-data.json", "r") as f:
            sample_data = json.load(f)
    except FileNotFoundError:
        print("❌ ERROR: Sample data file not found")
        return
    except json.JSONDecodeError as e:
        print(f"❌ ERROR: Invalid JSON in sample data file: {e}")
        return
    
    activities = sample_data.get("items", [])
    print(f"Found {len(activities)} activities to upload\n")
    
    success_count = 0
    
    # Post each activity
    for i, activity in enumerate(activities, 1):
        print(f"[{i}/{len(activities)}]", end=" ")
        
        # Transform data format
        api_data = transform_activity_data(activity)
        
        # Post to API
        if post_activity_to_api(api_data):
            success_count += 1
        
        print()  # Add spacing between entries
    
    print("-" * 60)
    print(f"📊 SUMMARY: {success_count}/{len(activities)} activities uploaded successfully")
    
    if success_count == len(activities):
        print("🎉 All activities uploaded successfully!")
    else:
        print(f"⚠️  {len(activities) - success_count} activities failed to upload")

if __name__ == "__main__":
    main()