FROM python:3.11.3-bullseye
ENV LANG en_US.UTF-8 LC_ALL=en_US.UTF-8

WORKDIR /app


COPY . .

RUN apt-get update && \
    apt-get install ffmpeg libsm6 libxext6  -y && \
    pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple && \
    pip install -r requirements.txt

EXPOSE 5002

CMD ["python","main.py"]

# docker run -d --name hello-lottery -v /path:/app/uploads -p 5002:5002 hello-lottery:latest
# docker run -d --name hello-lottery -v /path:/app/uploads -p 5002:5002 hello-lottery-small:latest
# docker run -d --name hello-lottery -v /D/Download:/app/uploads -p 5002:5002 hello-lottery-small:latest

