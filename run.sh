#!/bin/bash

if [ "$1" != "" ]; then
	python manage.py $@
	exit
fi

ET="eth0"
IP="$(ifconfig $ET | grep 'inet addr:' | cut -d: -f2 | awk '{ print $1 }')"
if [ "$IP" != "" ]; then
	python manage.py runserver $IP:8000
fi

