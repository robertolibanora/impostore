from flask import Flask, render_template, jsonify, request, session, redirect
import random
import uuid

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this-in-production'

WORDS = [
    "Davide Doati", "Zangi", "Figa della Salama", "Trans", "Tette",
    "Pitbull", "Malibu", "Belvedere", "Pennacchio", "Mutandine della Silvestro",
    "Samu27", "Luca Bertaglia", "Mario Sindaco", "Guolo", "Presidente",
    "Duce", "Predappio", "Moet Ice", "Peroni", "Berlusconi", "Noi Moderati",
    "Croox", "Gintoneria", "Davide Malibu", "Riviera", "Roma", "Maicol Zainaghi",
    "Mustang", "Eddy Boscolo", "Sarto SRL", "AlvaInox", "PartyClub",
    "Tanaka", "SalaVLT", "Poveri", "DonPerignon", "Emma Siviero", "Pizza",
    "Silvestro", "Smigol", "Senatore", "GinMare", "Negro", "Porcodio", "Skizzo Prando",
    "Carabinieri", "Babbo Natale", "Bar Da Vito", "Mercedes", "Wolkswagen Polo",
    "Porsce", "BMW", "Punto Nera", "Giulietta", "Alberto Vittorio", "Frocio", "Savoia",
    "Agente Segreto", "Mago", "Walkie-Talkie", "Roberto Weber", "Cicciona", "Bea",
    "Lanza", "Banana", "Pomodoro", "Cannone", "Bamba", "GS Club", "CatWoman", "3%",
    "Gratta & Vinci", "Valeria Mantovan", "Adria", "Reggia di Rottanova", "Bottiglietta D'Acqua", "Don Nicola",
    "Martina Libanora", "Dry", "Figa di Legno", "Berto Peloso", "Napoli", "Marocchino", "Cinese di Vespucci",
    "Escort Advisor", "Privé", "Console", "Consulente Finanziario", "Re di Roma", "SpringBreak",
    "LucaBig", "RAM", "Bello Figo", "Cazzetto", "Merda", "Gesù", "Pelato", "Orgia", "Sborra", "Incinta",
]

# Colori predefiniti per i giocatori
PLAYER_COLORS = [
    {"name": "Rosso", "color": "#ff0040"},
    {"name": "Giallo", "color": "#ffd700"},
    {"name": "Blu", "color": "#0080ff"},
    {"name": "Verde", "color": "#00ff80"},
    {"name": "Arancione", "color": "#ff8000"},
    {"name": "Viola", "color": "#8000ff"},
    {"name": "Rosa", "color": "#ff80ff"},
    {"name": "Azzurro", "color": "#80ffff"},
    {"name": "Marrone", "color": "#804000"},
    {"name": "Nero", "color": "#404040"},
    {"name": "Bianco", "color": "#ffffff"},
    {"name": "Grigio", "color": "#808080"},
    {"name": "Turchese", "color": "#00ffc0"},
    {"name": "Lime", "color": "#c0ff00"},
    {"name": "Magenta", "color": "#ff00c0"},
    {"name": "Ciano", "color": "#00c0ff"},
    {"name": "Indaco", "color": "#4000ff"},
    {"name": "Oro", "color": "#ffc000"},
    {"name": "Argento", "color": "#c0c0c0"},
    {"name": "Bronzo", "color": "#cd7f32"},
]

def shuffle_array(array):
    """Mescola un array in modo casuale"""
    shuffled = array.copy()
    random.shuffle(shuffled)
    return shuffled

def select_impostors(players, num_impostors):
    """Seleziona casualmente gli impostori tra i giocatori"""
    available_players = list(range(players))
    shuffled_players = shuffle_array(available_players)
    return set(shuffled_players[:num_impostors])

@app.route('/')
def index():
    # Redirect alla pagina di setup
    return redirect('/setup')

@app.route('/manifest.json')
def manifest():
    return app.send_static_file('manifest.json')

@app.route('/sw.js')
def service_worker():
    response = app.send_static_file('sw.js')
    response.headers['Content-Type'] = 'application/javascript'
    return response

@app.route('/setup')
def setup():
    # Genera un ID univoco per la sessione se non esiste
    if 'game_id' not in session:
        session['game_id'] = str(uuid.uuid4())
    return render_template('setup.html')

@app.route('/players')
def players():
    # Verifica che i parametri siano presenti
    players = request.args.get('players', type=int)
    impostors = request.args.get('impostors', type=int)
    
    if not players or not impostors:
        return redirect('/setup')
    
    return render_template('players.html')

@app.route('/game')
def game():
    # Verifica che i giocatori siano configurati
    if 'players' not in session:
        return redirect('/setup')
    
    return render_template('game.html')

@app.route('/api/players/setup', methods=['POST'])
def setup_players():
    """Configura i giocatori con i loro nomi"""
    data = request.get_json()
    players = int(data.get('players', 6))
    impostors = int(data.get('impostors', 1))
    player_names = data.get('player_names', [])
    
    # Validazione
    if players < 3 or players > 20:
        return jsonify({'error': 'Numero di giocatori non valido'}), 400
    if impostors < 1 or impostors >= players:
        return jsonify({'error': 'Numero di impostori non valido'}), 400
    if len(player_names) != players:
        return jsonify({'error': 'Numero di nomi non corrisponde al numero di giocatori'}), 400
    
    # Salva i nomi dei giocatori nella sessione
    session['players'] = players
    session['impostors'] = impostors
    session['player_names'] = player_names
    
    return jsonify({
        'success': True
    })

@app.route('/api/game/start', methods=['POST'])
def start_game():
    """Inizia una nuova partita"""
    if 'players' not in session:
        return jsonify({'error': 'Giocatori non configurati'}), 400
    
    players = session['players']
    impostors = session['impostors']
    
    # Mescola le parole
    shuffled_words = shuffle_array(WORDS)
    
    # Seleziona gli impostori per il primo turno
    impostor_set = select_impostors(players, impostors)
    
    # Salva lo stato nella sessione (mantiene i nomi dei giocatori)
    session['shuffled_words'] = shuffled_words
    session['current_word_index'] = 0
    session['current_player'] = 0
    session['impostor_set'] = list(impostor_set)
    session['total_words'] = len(WORDS)
    
    return jsonify({
        'success': True,
        'total_words': len(WORDS)
    })

@app.route('/api/game/next', methods=['POST'])
def next_card():
    """Ottiene la prossima card da mostrare"""
    if 'players' not in session:
        return jsonify({'error': 'Partita non iniziata'}), 400
    
    players = session['players']
    shuffled_words = session['shuffled_words']
    current_word_index = session['current_word_index']
    current_player = session['current_player']
    impostor_set = set(session['impostor_set'])
    player_names = session.get('player_names', [])
    
    # Calcola il turno corrente
    current_turn = current_word_index + 1
    
    # Ottieni la parola corrente
    word = shuffled_words[current_word_index]
    
    # Controlla se il giocatore corrente è un impostore
    is_impostor = current_player in impostor_set
    
    # Ottieni nome e colore del giocatore corrente
    player_name = player_names[current_player].get('name', f'Giocatore {current_player + 1}') if player_names else f'Giocatore {current_player + 1}'
    player_color = player_names[current_player].get('color', '#ffffff') if player_names else '#ffffff'
    
    # Prepara la risposta
    response = {
        'word': word if not is_impostor else None,
        'is_impostor': is_impostor,
        'current_player': current_player + 1,
        'total_players': players,
        'current_turn': current_turn,
        'total_turns': session['total_words'],
        'is_last_player': (current_player + 1) >= players,
        'player_name': player_name,
        'player_color': player_color
    }
    
    return jsonify(response)

@app.route('/api/game/advance', methods=['POST'])
def advance_game():
    """Avanza al prossimo giocatore o turno"""
    if 'players' not in session:
        return jsonify({'error': 'Partita non iniziata'}), 400
    
    players = session['players']
    impostors = session['impostors']
    shuffled_words = session['shuffled_words']
    current_word_index = session['current_word_index']
    current_player = session['current_player']
    total_words = session['total_words']
    
    # Incrementa il giocatore
    current_player += 1
    
    # Se tutti i giocatori hanno visto questa parola
    if current_player >= players:
        current_player = 0
        current_word_index += 1
        
        # Controlla se ci sono altre parole
        if current_word_index >= total_words:
            # Fine partita
            session.pop('players', None)
            session.pop('impostors', None)
            session.pop('shuffled_words', None)
            session.pop('current_word_index', None)
            session.pop('current_player', None)
            session.pop('impostor_set', None)
            session.pop('total_words', None)
            return jsonify({
                'game_ended': True
            })
        
        # Seleziona nuovi impostori casuali per il nuovo turno
        impostor_set = select_impostors(players, impostors)
        session['impostor_set'] = list(impostor_set)
    
    # Aggiorna lo stato nella sessione
    session['current_player'] = current_player
    session['current_word_index'] = current_word_index
    
    return jsonify({
        'success': True,
        'current_player': current_player,
        'current_word_index': current_word_index
    })

@app.route('/api/players/colors', methods=['GET'])
def get_player_colors():
    """Ottiene la lista dei colori disponibili per i giocatori"""
    return jsonify({
        'colors': PLAYER_COLORS
    })

@app.route('/api/game/state', methods=['GET'])
def get_state():
    """Ottiene lo stato corrente del gioco"""
    if 'players' not in session:
        return jsonify({'game_active': False})
    
    return jsonify({
        'game_active': True,
        'players': session['players'],
        'impostors': session['impostors'],
        'current_player': session['current_player'],
        'current_word_index': session['current_word_index'],
        'total_words': session['total_words']
    })

if __name__ == '__main__':
    app.run(debug=True, port=5555, host='0.0.0.0')
