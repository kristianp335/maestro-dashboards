#!/usr/bin/env python3
"""
Create all Maestro object definitions via Liferay Headless API
Uses the object-admin API to properly create objects with folder references
"""

import json
import requests
import base64
import os
import glob
import time
from datetime import datetime

# Liferay API configuration
LIFERAY_BASE_URL = "https://webserver-lctcreditagricole-prd.lfr.cloud"
OBJECT_ADMIN_ENDPOINT = "/o/object-admin/v1.0/object-definitions"

def get_auth_header():
    """Create Basic Auth header from environment secrets"""
    username = os.getenv('LIFERAY_USERNAME')
    password = os.getenv('LIFERAY_PASSWORD')
    
    if not username or not password:
        raise ValueError("LIFERAY_USERNAME and LIFERAY_PASSWORD environment variables required")
    
    credentials = f"{username}:{password}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded_credentials}"

def load_object_definition(file_path):
    """Load and validate object definition from JSON file"""
    try:
        with open(file_path, 'r') as f:
            definition = json.load(f)
        
        # Validate required fields
        required_fields = ['name', 'label', 'objectFields', 'pluralLabel', 'scope']
        for field in required_fields:
            if field not in definition:
                raise ValueError(f"Missing required field: {field}")
        
        # Ensure objectFolderExternalReferenceCode is present
        if 'objectFolderExternalReferenceCode' not in definition:
            print(f"⚠️  Warning: {file_path} missing objectFolderExternalReferenceCode")
        
        return definition
        
    except Exception as e:
        print(f"❌ Error loading {file_path}: {str(e)}")
        return None

def create_object_definition(definition, file_name):
    """Create object definition via API"""
    url = LIFERAY_BASE_URL + OBJECT_ADMIN_ENDPOINT
    headers = {
        "Authorization": get_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    print(f"📤 Creating object: {definition['name']} ({file_name})")
    print(f"   Label: {definition['label']}")
    print(f"   Fields: {len(definition['objectFields'])}")
    print(f"   Folder Reference: {definition.get('objectFolderExternalReferenceCode', 'N/A')}")
    
    try:
        response = requests.post(url, json=definition, headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            result = response.json()
            object_id = result.get('id')
            rest_path = result.get('restContextPath')
            print(f"   ✅ SUCCESS: Object created with ID {object_id}")
            print(f"   📡 REST Context Path: {rest_path}")
            
            return {
                'success': True,
                'id': object_id,
                'name': definition['name'],
                'restContextPath': rest_path,
                'definition': result
            }
        else:
            error_text = response.text
            print(f"   ❌ FAILED: {response.status_code}")
            print(f"   Error: {error_text[:200]}...")
            
            return {
                'success': False,
                'error': error_text,
                'status_code': response.status_code
            }
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def publish_object_definition(object_id, object_name):
    """Publish object definition to make it active"""
    url = f"{LIFERAY_BASE_URL}{OBJECT_ADMIN_ENDPOINT}/{object_id}/publish"
    headers = {
        "Authorization": get_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    print(f"📣 Publishing object: {object_name} (ID: {object_id})")
    
    try:
        response = requests.post(url, headers=headers)
        print(f"   Publish Status: {response.status_code}")
        
        if response.status_code in [200, 201, 204]:
            print(f"   ✅ Published successfully")
            return True
        else:
            print(f"   ⚠️  Publish response: {response.text[:100]}")
            return False
            
    except Exception as e:
        print(f"   ❌ Publish error: {str(e)}")
        return False

def main():
    """Create all Maestro object definitions via API"""
    print("🚀 Creating all Maestro object definitions via Headless API...")
    print(f"🌐 Target: {LIFERAY_BASE_URL}{OBJECT_ADMIN_ENDPOINT}")
    print("=" * 70)
    
    # Define object creation order (dependencies first)
    object_files = [
        "maestro-clients.object-definition.json",
        "maestro-loans.object-definition.json", 
        "maestro-deals.object-definition.json",
        "maestro-gfd-activities.object-definition.json",
        "maestro-performance-kpis.object-definition.json",
        "maestro-risk-metrics.object-definition.json",
        "maestro-workflow-metrics.object-definition.json"
    ]
    
    objects_dir = "liferay-workspace/client-extensions/maestro-objects/objects"
    created_objects = []
    failed_objects = []
    
    # Create each object definition
    for i, file_name in enumerate(object_files, 1):
        file_path = os.path.join(objects_dir, file_name)
        
        print(f"\\n[{i}/{len(object_files)}] Processing {file_name}...")
        print("-" * 50)
        
        # Load definition
        definition = load_object_definition(file_path)
        if not definition:
            failed_objects.append({'file': file_name, 'error': 'Failed to load definition'})
            continue
        
        # Create object
        result = create_object_definition(definition, file_name)
        
        if result['success']:
            created_objects.append(result)
            
            # Auto-publish if creation successful
            time.sleep(1)  # Brief delay
            publish_success = publish_object_definition(result['id'], result['name'])
            result['published'] = publish_success
        else:
            failed_objects.append({
                'file': file_name, 
                'error': result.get('error', 'Unknown error'),
                'status_code': result.get('status_code')
            })
        
        time.sleep(2)  # Delay between creations
    
    # Summary
    print("\\n" + "=" * 70)
    print("📊 OBJECT CREATION SUMMARY:")
    print(f"✅ Successfully created: {len(created_objects)}")
    print(f"❌ Failed: {len(failed_objects)}")
    print(f"📤 Published: {sum(1 for obj in created_objects if obj.get('published', False))}")
    
    if created_objects:
        print("\\n🎉 CREATED OBJECTS:")
        for obj in created_objects:
            status = "📤 Published" if obj.get('published') else "⏳ Created"
            print(f"  {status}: {obj['name']} (ID: {obj['id']}) → {obj['restContextPath']}")
    
    if failed_objects:
        print("\\n❌ FAILED OBJECTS:")
        for obj in failed_objects:
            print(f"  - {obj['file']}: {obj['error']}")
    
    if len(created_objects) == len(object_files):
        print("\\n🚀 ALL OBJECTS CREATED SUCCESSFULLY!")
        print("Ready to create sample data via APIs...")
        return True
    else:
        print(f"\\n⚠️  {len(failed_objects)} objects failed - may need manual intervention")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)