from flask import Flask, render_template, request, jsonify
from keras.models import load_model
from keras.metrics import top_k_categorical_accuracy
import numpy as np
from PIL import Image
from skimage import transform
from PIL import Image
import base64
import sys
import io
import tensorflow as tf 

app = Flask(__name__)

IMG_SIZE = 512

def top_2_accuracy(in_gt, in_pred):
    return top_k_categorical_accuracy(in_gt, in_pred, k=2)

retina_model = load_model('./model/DenseNet201_d3_512_1_model.h5', custom_objects={'top_2_accuracy': top_2_accuracy})
graph = tf.get_default_graph()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['GET', 'POST'])
def predict_image():
    if request.method == 'POST':
        message = request.get_json(force=True)
        encoded = message['image']
        decoded = base64.b64decode(encoded)
        with graph.as_default(): 
            image = Image.open(io.BytesIO(decoded))
            np_image = np.array(image).astype('float32')/255
            np_image = transform.resize(np_image, (IMG_SIZE, IMG_SIZE, 3))
            img = np.expand_dims(np_image, axis=0)
            preds = retina_model.predict(img)[0]
            res = [(k, 100*v, '*'*int(10*v)) for k, v in sorted(enumerate(preds), key = lambda x: -1*x[1])]
            del(img)
            return jsonify({
                'pres': res
            })
    

if __name__ == '__main__':
    app.run(port=3001,debug=True)
    print('Server is running', file=sys.stdout)