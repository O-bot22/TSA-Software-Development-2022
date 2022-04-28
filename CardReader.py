#!usr/bin/env python

import mariadb
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
import time
import math

reader = SimpleMFRC522()

try:
	conn = mariadb.connect(
		user = "owen",
		password = "password",
		host = "localhost",
		database = "TimeTracker"
	)
	print("connected")
except mariadb.Error as e:
	print("der was err`or")
	print(e)

cur = conn.cursor()
current_users = []
login_times = []
while True:
	try:
		print("Current users: "+str(current_users))
		id, text = reader.read()
		buf = text.replace(' ','').split(",")
		name = buf[0]
		IDnum = buf[1]
		t = time.time()
		if name in current_users:
			#loggin out
			i = current_users.index(name)
			current_users.pop(i)
			t0 = login_times[i]
			total_time = math.floor(t-t0)
			login_times.pop(i)
			print("user: "+name+" with student_ID number "+IDnum+" was here for "+str(total_time)+"seconds")
			cur.execute("INSERT INTO times (time_in, time_out, duration, student_ID) VALUES("+str(t0)+", "+str(t)+", "+str(total_time)+", "+IDnum+")")
		else:
			#loggin in
			current_users.append(name)
			login_times.append(t)
			print("user: "+name+" signed in at "+str(t))
		print("processing")
		time.sleep(0.5)
		print('.')
		time.sleep(0.5)
		print('.')
		time.sleep(0.5)
		print('.')
		time.sleep(0.5)
		print('done')
		#cur.excecute("INSERT INTO times VALUES ("++")")
		#cur.execute("SELECT * FROM classes;")  #input("sql query:"))
		#print(cur.fetchall())
	except KeyboardInterrupt:
		break

GPIO.cleanup()
conn.commit()
conn.close()

