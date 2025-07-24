import { type FormEvent } from "react";
import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { useSearchParams } from "react-router-dom";

function RegisterForm() {
    const [username,setUsername] = useState<string>('');
    const [name,setName] = useState<string>('');
    const [status,setStatus] = useState<string>('');
    const [ searchParms ] = useSearchParams();
    const token = searchParms.get('token') || "test";

    async function handleRegister(event:FormEvent) {
        event.preventDefault();

        let options;
        try {
            const optionsRes = await fetch(`/api/generate-registration-options?username=${encodeURIComponent(username)}&name=${encodeURIComponent(name)}&token=${encodeURIComponent(token)}`);
            if(!optionsRes.ok) {
                const err = await optionsRes.json();
                throw new Error(err.error || 'failed to generate registration options');
            }

            options = await optionsRes.json();
           
        } catch (error) {
            console.log(error);
            setStatus(`${error}`);
            return;
        }

        let attResp;
        try {
            attResp = await startRegistration(options); 
        } catch (error) {
            console.log(error);
            setStatus(`${error}`);
            return;
        }

        const verificationResp = await fetch('/api/verify-registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attResp)

        });

        const verificationJSON = await verificationResp.json();

        if (verificationJSON && verificationJSON.verified) {
            setStatus("You have successfully registered!")
        }  else  {
            setStatus("Error: Unable to verify response");
        }



    }

    return (
        <div>
            <div id="status">{status}</div>
            <form onSubmit={handleRegister}>
                <label>Enter your name:
                    <input type="text" value={name} onChange={(e)=> setName(e.target.value)} />
                </label>
                <br/>
                <label>
                    Enter your username:
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
            </form>
            <button type="submit" onClick={handleRegister}>Register</button>
        </div>
    )

}

export default RegisterForm;