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

IMG_SIZE = 224

def top_2_accuracy(in_gt, in_pred):
    return top_k_categorical_accuracy(in_gt, in_pred, k=2)

retina_model = load_model('model\densenet_1_10_4_2023.h5') 
graph = tf.compat.v1.get_default_graph()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['GET', 'POST'])
def predict_image():
    if request.method == 'POST':
        predictions=["Mild","Moderate","No_DR","Proliferate_DR","Severe"] 
        message = request.get_json(force=True)
        encoded = message['image']
        decoded = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(decoded))
        np_image = np.array(image).astype('float32')/255
        np_image = transform.resize(np_image, (IMG_SIZE, IMG_SIZE, 3))
        img = np.expand_dims(np_image, axis=0)
        predict=retina_model.predict(img)
        preds = predict[0]
        pred=np.argmax(predict,axis=1)
        res = [(predictions[k], round(100*v, 2)) for k, v in sorted(enumerate(preds), key = lambda x: -1*x[1])]
        del(img)
        print(res)
        return jsonify({
            'pres': res
        })
    

if __name__ == '__main__':
    app.run(port=3001)
    print('Server is running', file=sys.stdout)