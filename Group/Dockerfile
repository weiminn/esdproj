# base image
FROM python:3

# application folder
WORKDIR /usr/src/app

#copy req.txt to pwd of the docker
COPY requirements.txt ./

# execute into the image
RUN pip install --no-cache-dir -r requirements.txt

# copy code into pwd of docker image
COPY ./group.py .

# execute inside the image
CMD [ "python", "./group.py" ]
