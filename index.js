class ESRM {
    constructor(req, res) {
        this.fs = require('fs');
        this.req = req;
        this.res = res;
    }

    stream(filePath) {
        const options = {};

        let start;
        let end;

        const range = this.req.headers.range;

        if (range) {
            const bytesPrefix = 'bytes=';
            if (range.startsWith(bytesPrefix)) {
                const bytesRange = range.substring(bytesPrefix.length);
                const parts = bytesRange.split('-');
                if (parts.length === 2) {
                    const rangeStart = parts[0] && parts[0].trim();
                    if (rangeStart && rangeStart.length > 0) {
                        options.start = start = parseInt(rangeStart);
                    }
                    const rangeEnd = parts[1] && parts[1].trim();
                    if (rangeEnd && rangeEnd.length > 0) {
                        options.end = end = parseInt(rangeEnd);
                    }
                }
            }
        }

        this.res.setHeader('content-type', 'video/mp4');

        this.fs.stat(filePath, (err, stat) => {
            if (err) {
                console.error(`File stat error for ${filePath}.`);
                console.error(err);
                this.res.sendStatus(500);
                return;
            }

            let contentLength = stat.size;

            if (this.req.method === 'HEAD') {
                this.res.statusCode = 200;
                this.res.setHeader('accept-ranges', 'bytes');
                this.res.setHeader('content-length', contentLength);
                this.res.end();
            } else {
                let retrievedLength;
                if (start !== undefined && end !== undefined) {
                    retrievedLength = end + 1 - start;
                } else if (start !== undefined) {
                    retrievedLength = contentLength - start;
                } else if (end !== undefined) {
                    retrievedLength = end + 1;
                } else {
                    retrievedLength = contentLength;
                }

                this.res.statusCode = start !== undefined || end !== undefined ? 206 : 200;

                this.res.setHeader('content-length', retrievedLength);

                if (range !== undefined) {
                    this.res.setHeader(
                        'content-range',
                        `bytes ${start || 0}-${end || contentLength - 1}/${contentLength}`
                    );
                    this.res.setHeader('accept-ranges', 'bytes');
                }

                const fileStream = this.fs.createReadStream(filePath, options);
                fileStream.on('error', (error) => {
                    console.log(`Error reading file ${filePath}.`);
                    console.log(error);
                    this.res.sendStatus(500);
                });

                return fileStream.pipe(this.res);
            }
        });
    }
}

module.exports = ESRM;