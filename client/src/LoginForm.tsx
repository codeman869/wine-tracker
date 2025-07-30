import { startAuthentication } from "@simplewebauthn/browser";
import { useState, type FormEvent} from 'react';

function LoginForm() {
    const [username,setUsername] = useState<string>('');
    const [status, setStatus] = useState<string>('');


    async function handleLogin(event:FormEvent) {
        event.preventDefault();

        let optionsJSON; 
        try {
            const optionsRes = await fetch(`/api/auth/generate-authentication-options?username=${encodeURIComponent(username)}`);

            if(!optionsRes.ok) {
                const err = await optionsRes.json();
                throw new Error(err.error || 'Failed to generate authentication options');
            }

            optionsJSON = await optionsRes.json();

        } catch (error) {
            console.log(error);
            setStatus(`${error}`);
            return;
        }

        let assResp;
        try {
            assResp = await startAuthentication({optionsJSON});


        } catch (error) {
            console.log(error);
            setStatus(`${error}`);
            return;
        }

        const verificationResp = await fetch('/api/auth/verify-authentication', {
            method: 'POST',
            headers:  {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(assResp)
        });

        const verificationJSON = await verificationResp.json();

        if(verificationJSON && verificationJSON.verified) {
            setStatus("Logged in!");
        } else  {
            setStatus("An error occurred logging in");
        }


    }

    return (
        <div>
            <div id='status'>{status}</div>
            <form onSubmit={handleLogin}>
                <label>Username:</label>
                <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)}></input>
            </form>
            <button type="submit" onClick={handleLogin}>Login</button>
        </div>
    )
}

export default LoginForm;