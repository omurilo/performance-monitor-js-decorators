#!/bin/bash
curl -X POST --data "{\"name\":\"$1\"}" "localhost:3000/people"