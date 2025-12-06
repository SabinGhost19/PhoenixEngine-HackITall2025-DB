import Docker from 'dockerode';

declare global {
    var docker: Docker | undefined;
}

let docker: Docker;

if (!global.docker) {
    // Connect to the socket mounted in the container
    global.docker = new Docker({ socketPath: '/var/run/docker.sock' });
}
docker = global.docker;

export default docker;
