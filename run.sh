#!/bin/bash

ET="eth0"
if [ "$1" != "" ]; then
    ET=$1
fi

IP=""
IP="$(ifconfig $ET | grep 'inet addr:' | cut -d: -f2 | awk '{ print $1}')"
if [ "$IP" != "" ] ; then
    python manage.py runserver $IP:8000
fi