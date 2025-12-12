# coding=utf-8
from flask import Flask, request, render_template, jsonify
from flask_restful import Api, Resource
import base64
import json
from gevent.pywsgi import WSGIServer
from lottery import *
from werkzeug.utils import secure_filename

import os
from io import BytesIO
l = Lottery()

# Define a flask app
app = Flask(__name__)
app.debug = False
app.config.update(RESTFUL_JSON=dict(ensure_ascii=False))
api = Api(app)




@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'code': 200})


@app.route('/base64',methods=['POST'])
def base64predict():
    global imagedata
    try:
        imagedata = request.values['image']
        imagedata = base64.b64decode(imagedata)
        imagedata = BytesIO(imagedata)
    except:
        res = {'code': 501, 'msg': 'base64解码失败'}
    try:
        res = ""
        try:
            for i in range(4):
                res = l(imagedata)
                if not res:
                    imagedata = np.rot90(imagedata, k=3)
                else:
                    break
            if not res:
                raise MissingInfoException("没有检测到彩票信息，请调整图片后重试。")
            print(res)
            res = str(Result.fromTuple(res))
            print(res)
        except Exception as e:
            res = str(e)

        res = {'code': 200, 'msg': '识别成功','data':res}
    except:
        res = {'code': 501, 'msg': '程序错误'}
    return res


@app.route('/predict', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        # Get the file from post request
        f = request.files['file']

        # Save the file to ./uploads
        basepath = os.path.dirname(__file__)
        upload_path = os.path.join(basepath, 'uploads')
        if not os.path.exists(upload_path):
            os.makedirs(upload_path)
        file_path = os.path.join(upload_path, secure_filename(f.filename))
        f.save(file_path)

        # Make prediction
        res = ""
        try:
            for i in range(4):
                res = l(file_path)
                if not res:
                    file_path = np.rot90(file_path, k=3)
                else:
                    break
            if not res:
                raise MissingInfoException("没有检测到彩票信息，请调整图片后重试。")
            print(res)
            res = str(Result.fromTuple(res))
            print(res)
            res = {'code': 200, 'msg': '识别成功', 'data': res}
        except Exception as e:
            res = str(e)
            res = {'code': 200, 'msg': '识别成功', 'data': res}
        # preds=model_predict("C://l/c1.jpg",model)
        # Process your result for human
        # pred_class = preds.argmax(axis=-1)            # Simple argmax
        # pred_class = decode_predictions(preds, top=1)   # ImageNet Decode
        # result = str(pred_class[0][0][1])               # Convert to string

        return res
    return None

if __name__ == '__main__':
    # app.run(host='127.0.0.1',port=5002, debug=True)

    # Serve the app with gevent
    http_server = WSGIServer(('0.0.0.0', 7860), app)
    http_server.serve_forever()