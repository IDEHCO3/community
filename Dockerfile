FROM ubuntu:14.04
RUN apt-get update && apt-get install -y \
    python \
    python-dev \
    python-pip \
    python-psycopg2 \
    libpq-dev \
    libgdal-dev

RUN mkdir /code
WORKDIR /code
ADD . .
RUN pip install -r requirements.txt
EXPOSE 8000
CMD run.sh