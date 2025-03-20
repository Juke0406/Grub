# Side application for GRUB

This application mimics the sample set up for business clients that scans their database periodically, applies discount and send these data to the GRUB application to be listed

## Setup

```bash
python3 -m venv ./venv
source ./venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

As this is a demo application, pressing the "demo" button will send a json list of products to the GRUB applicaiton.

It is recommended to visit localhost:3000/api/api-keys and fill in any of the API key to demonstrate API key usage value increasing.

Update the URL value in the main.py to point to the deployed app url or local development server for testing
