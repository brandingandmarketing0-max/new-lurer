# Rachel Link Testing Scripts

This directory contains Python scripts to test accessing the rachel links with a specific user agent.

## Scripts

### 1. `simple_rachel_test.py` - Simple Test Script
A straightforward script that tests the rachel endpoints with the specified user agent.

**Usage:**
```bash
python simple_rachel_test.py
```

### 2. `test_rachel_access.py` - Advanced Test Script
A more comprehensive script with detailed analysis and reporting.

**Usage:**
```bash
python test_rachel_access.py
```

## Configuration

Before running the scripts, you may need to update the `BASE_URL` variable in the scripts:

```python
BASE_URL = "http://localhost:3000"  # Change to your actual domain
```

For example:
- Local development: `http://localhost:3000`
- Production: `https://yourdomain.com`

## User Agent

The scripts use the specified user agent:
```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
```

## Tested Endpoints

The scripts test the following endpoints:
- `/rachel`
- `/rachelirl`
- `/rachsotiny`

## Output

The scripts will:
1. Display response status codes and timing
2. Check for bot detection mechanisms
3. Save HTML responses to files for analysis
4. Show redirect chains if any
5. Generate detailed reports

## Requirements

Install the required Python packages:

```bash
pip install -r requirements.txt
```

## Expected Behavior

Based on the code analysis, the rachel pages include:
- Bot detection using BotD library
- Obfuscated URLs and content
- Click tracking analytics
- Age verification modals
- Redirects to external OnlyFans links

The scripts will help you understand how the pages respond to different user agents and whether bot protection is triggered.

