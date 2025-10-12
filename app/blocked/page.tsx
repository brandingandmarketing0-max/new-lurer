export default function Blocked() {
    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <title>This site can't be reached</title>
                <style>{`
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #fff; }
                    .error-container { max-width: 600px; margin: 0 auto; }
                    .error-title { color: #5f6368; font-size: 20px; margin-bottom: 16px; }
                    .error-message { color: #5f6368; font-size: 14px; line-height: 1.5; }
                    .error-code { color: #5f6368; font-size: 12px; margin-top: 20px; }
                `}</style>
            </head>
            <body>
                <div className="error-container">
                    <div className="error-title">This site can't be reached</div>
                    <div className="error-message">
                        The webpage might be temporarily down or it may have moved permanently to a new web address.
                    </div>
                    <div className="error-code">ERR_QUIC_PROTOCOL_ERROR</div>
                </div>
            </body>
        </html>
    );
}


