FROM nginx:latest

ENV TZ=Asia/Seoul

# 유틸리티 설치 (vim, net-tools, curl, bash)
RUN apt-get update && \
    apt-get install -y \
    vim \
    net-tools \
    curl \
    bash && \
    apt-get clean && \
    apt-get autoclean && \
    apt-get autoremove -y && \
    rm -rf /var/lib/{apt,dpkg,cache,log}


# React 빌드 결과 복사
COPY ./dist /usr/share/nginx/html

# 포트 오픈
EXPOSE 5111

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
