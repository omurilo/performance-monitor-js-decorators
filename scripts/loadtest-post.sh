#!/bin/bash
npx autocannon -m POST --body "{\"name\":\"$1\"}" -d 15 -L 100 -w 1 -O 5 -r 3 "localhost:3000/people"