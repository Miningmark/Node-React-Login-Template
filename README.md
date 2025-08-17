# Ubuntu 24.04 LTS Installation Guide

### 1. Updating und upgrading depedencies

`sudo apt update`  
`sudo apt upgrade `

### 2. Install Certbot

`sudo apt install certbot`

### 3. Installing docker and docker-compose

`sudo apt install apt-transport-https curl`  
`curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg`  
`echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`  
`sudo apt update`

`sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-compose`

### 4. Receive first SSL Certifacte bevor deploying

`certbot certonly --standalone --register-unsafely-without-email`

### 5. Generate SSH Key and adding to Github

`cd /root/.ssh`  
`ssh-keygen -t rsa -b 4096 -C "username@email.com"`  
`eval "$(ssh-agent -s)"`  
`ssh-add ~/.ssh/id_rsa`  
`cat ~/.ssh/id_rsa.pub`

-   adding key under github settings > SSH and GPG keys

### 6. Generate Local SSH Key on **another machine**

**on another machine**  
`cd .ssh`  
`ssh-keygen -t rsa -b 4096 -C "username@email.com"`

**on ubuntu server**  
`cd /root/.ssh`  
`nano authorized_keys`

-   copy content of "id_rsa.pub" inside authorized_keys and save file

**on github**

-   copy content of "id_rsa" github repo > settings > secrets and variables > actions > New repository secret: SSH_PRIVATE_KEY (complete file content)

### 7. Add github secrets

-   github repo > settings > secrets and variables > actions > New repository secret: HOST_IP (add your Server IP)
-   github repo > settings > secrets and variables > actions > New repository secret: USERNAME (add your Linux username)
-   github repo > settings > secrets and variables > actions > New repository secret: TARGET_DIR (add your folder in which this project should be located)

### 8. clone github repo to ubuntu server

`cd /var/www/`  
`git clone git@github.com:*username*/*reponame*.git`

### 9. creating .env files

-   add all env variables from .env.example inside and fill it out  
    `cd /var/www/*reponame*`  
     `nano .env`
-   add all env variables from .env.example inside and fill it out  
    `cd backend`  
    `nano .env`
-   add all env variables from .env.example inside and fill it out  
    `cd ..`  
     `cd frontend`  
     `nano .env`
