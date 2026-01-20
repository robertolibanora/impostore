# impostore

Web app in **Flask** per giocare a “Impostore” dal browser (UI in `templates/`, asset in `static/`).

## Requisiti

- Python 3.10+ (consigliato)

## Avvio in locale

1) Crea e attiva un virtualenv (consigliato)

```bash
python -m venv .venv
source .venv/bin/activate
```

2) Installa le dipendenze

```bash
pip install -r requirements.txt
```

3) Avvia l’app

```bash
python app.py
```

Poi apri `http://localhost:5555`.

## Struttura progetto

- `app.py`: server Flask + API di gioco
- `templates/`: pagine HTML
- `static/`: CSS/JS + PWA (manifest + service worker)

## Note

- In produzione cambia `app.secret_key` (attualmente è un placeholder).

