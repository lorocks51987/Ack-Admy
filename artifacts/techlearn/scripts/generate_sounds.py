import wave
import math
import struct
import os

def generate_wav(filename, notes, duration=0.4, type="sine", sample_rate=22050, volume=0.5):
    """
    Gera um arquivo WAV mono, 16-bit PCM com notas especificadas.
    notes: lista de tuplas (frequencia, start_time_ratio, volume_ratio)
    """
    num_samples = int(duration * sample_rate)
    data_buffer = [0] * num_samples
    
    for freq, start_ratio, vol_ratio in notes:
        start_sample = int(start_ratio * num_samples)
        note_samples = num_samples - start_sample
        for i in range(note_samples):
            idx = start_sample + i
            if idx >= num_samples:
                break
            t = float(i) / sample_rate
            
            # Decaimento exponencial suave para evitar cliques no áudio
            decay = math.exp(-4.0 * float(i) / note_samples)
            
            # Tipos de onda
            if type == "sine":
                val = math.sin(2.0 * math.pi * freq * t)
            elif type == "triangle":
                # Onda triangular
                period = sample_rate / freq
                val = 2.0 * abs(2.0 * (t * freq - math.floor(t * freq + 0.5))) - 1.0
            else:
                val = math.sin(2.0 * math.pi * freq * t)
                
            data_buffer[idx] += val * volume * vol_ratio * decay

    # Normaliza e limita para evitar clipping
    max_val = max(abs(x) for x in data_buffer) if data_buffer else 0
    scale = 32767 / max_val if max_val > 1.0 else 32767

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        for x in data_buffer:
            val = int(x * scale * 0.9)  # Deixa 10% de margem de segurança
            val = max(-32768, min(32767, val))
            data = struct.pack('<h', val)
            wav_file.writeframesraw(data)
    print(f"Gerado: {filename} ({os.path.getsize(filename)} bytes)")

# 1. correct.wav: Arpejo curto alegre (C5 -> E5)
# Frequências: C5=523.25, E5=659.25
generate_wav(
    "assets/sounds/correct.wav",
    [(523.25, 0.0, 0.8), (659.25, 0.25, 1.0)],
    duration=0.35,
    type="sine",
    volume=0.4
)

# 2. wrong.wav: Som descendente grave (Buzz de erro)
# Deslizando a frequência de 150 Hz para 100 Hz
num_samples_wrong = int(0.3 * 22050)
wrong_notes = []
for i in range(num_samples_wrong):
    ratio = float(i) / num_samples_wrong
    freq = 150 - 50 * ratio
    # Adicionamos pequenas notas sucessivas ou uma única com frequência variável
    # Para simplificar no gerador genérico, vamos passar uma rampa
    pass

# Vamos fazer uma função especializada para o wrong para ter a frequência deslizando suavemente
def generate_wrong(filename, start_freq=150, end_freq=100, duration=0.3, sample_rate=22050, volume=0.5):
    num_samples = int(duration * sample_rate)
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        
        phase = 0.0
        for i in range(num_samples):
            ratio = float(i) / num_samples
            freq = start_freq + (end_freq - start_freq) * ratio
            decay = math.exp(-3.5 * ratio)
            
            # Onda triangular aproximada para soar como buzz clássico de jogo
            val = 2.0 * abs(2.0 * (phase - math.floor(phase + 0.5))) - 1.0
            phase += freq / sample_rate
            
            sample_val = int(32767 * val * volume * decay)
            sample_val = max(-32768, min(32767, sample_val))
            data = struct.pack('<h', sample_val)
            wav_file.writeframesraw(data)
    print(f"Gerado: {filename} ({os.path.getsize(filename)} bytes)")

generate_wrong("assets/sounds/wrong.wav", volume=0.4)

# 3. victory.wav: Arpejo lindo de vitória (C4 -> E4 -> G4 -> C5)
# C4=261.63, E4=329.63, G4=392.00, C5=523.25
generate_wav(
    "assets/sounds/victory.wav",
    [
        (261.63, 0.0, 0.6),
        (329.63, 0.2, 0.7),
        (392.00, 0.4, 0.8),
        (523.25, 0.6, 1.0)
    ],
    duration=0.8,
    type="sine",
    volume=0.35
)

# 4. badge.wav: Fanfarra curta de badge (G4 -> B4 -> D5 -> G5)
# G4=392.00, B4=493.88, D5=587.33, G5=783.99
generate_wav(
    "assets/sounds/badge.wav",
    [
        (392.00, 0.0, 0.6),
        (493.88, 0.2, 0.7),
        (587.33, 0.4, 0.8),
        (783.99, 0.6, 1.0)
    ],
    duration=0.6,
    type="sine",
    volume=0.35
)

# 5. hint.wav: Click suave neutro (880 Hz descendente rápido para 440 Hz)
def generate_slide(filename, start_freq, end_freq, duration=0.15, sample_rate=22050, volume=0.4):
    num_samples = int(duration * sample_rate)
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        
        phase = 0.0
        for i in range(num_samples):
            ratio = float(i) / num_samples
            freq = start_freq * math.pow(end_freq / start_freq, ratio)
            decay = math.exp(-5.0 * ratio)
            
            val = math.sin(2.0 * math.pi * phase)
            phase += freq / sample_rate
            
            sample_val = int(32767 * val * volume * decay)
            sample_val = max(-32768, min(32767, sample_val))
            data = struct.pack('<h', sample_val)
            wav_file.writeframesraw(data)
    print(f"Gerado: {filename} ({os.path.getsize(filename)} bytes)")

generate_slide("assets/sounds/hint.wav", 880, 440, duration=0.15, volume=0.3)

# 6. xp_spent.wav: Moeda gasta (300 Hz decaindo para 200 Hz rapidamente)
generate_slide("assets/sounds/xp_spent.wav", 300, 200, duration=0.15, volume=0.3)

print("Todos os efeitos sonoros WAV gerados offline com sucesso!")
