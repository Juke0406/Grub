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
