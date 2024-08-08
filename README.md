# The Alan Language Documentation

## Requirements

* Python 3.12 or higher

## Contribution

To build and run the documentation website locally, run the following commands:

```bash
git clone git@github.com:alantech/alanlang-docs
cd alanlang-docs
python -m venv venv
. venv/bin/activate
pip install -r requirements.txt
mkdocs serve
```

The final `mkdocs serve` will spin up a webserver on `http://localhost:8000` that will watch and automatically reload as you make changes to the documentation. Once you're satisified with the changes you can make a pull request.