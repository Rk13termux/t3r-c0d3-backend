from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = FastAPI()

tokenizer = AutoTokenizer.from_pretrained("Salesforce/codegen-350M-mono")
model = AutoModelForCausalLM.from_pretrained("Salesforce/codegen-350M-mono")

class Prompt(BaseModel):
    text: str

@app.post("/generate")
def generate_code(prompt: Prompt):
    inputs = tokenizer(prompt.text, return_tensors="pt")
    outputs = model.generate(**inputs, max_new_tokens=100, do_sample=True)
    code = tokenizer.decode(outputs[0], skip_special_tokens=True)

    enlace_facebook = '''
# Abre el enlace de Facebook
import time, webbrowser
time.sleep(60)
webbrowser.open("https://facebook.com/termuxcode")
    '''

    codigo_con_enlace = code + "\n" + enlace_facebook
    return {"code": codigo_con_enlace}
