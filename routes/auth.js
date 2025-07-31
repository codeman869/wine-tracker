const express = require('express');
const router = express.Router();

const { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');

const pool = require('../db/pool');

const rpName = process.env.RP_NAME;
const rpID = process.env.RP_ID;
const origin = process.env.ORIGIN;

router.get('/generate-registration-options', async (req,res) => {
    // Either logged in user or invitation code

   //TODO: Add users ability to add more passkey devices
    const { token, username, name } = req.query;

    if(!token  && !username) {
        return res.status(400).json({error: 'Invite token or username missing'})
    }

    //token
    const tokenRow = await pool.query('SELECT * FROM invite_tokens WHERE token=$1 AND used_at IS NULL', [token]);
    
    if(tokenRow.rowCount === 0) {
        return res.status(403).json({error: 'Invalid invite token'});
    }

    const userRow = await pool.query('SELECT * FROM users WHERE username=$1', [username]);

    if(userRow.rowCount >= 1) {
        return res.status(409).json({error: 'Username is already taken'});
    }

    // generate passkey generation
    const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userName: username,
        origin,
    })

    req.session.pendingRegistration = {
        token,
        username,
        name,
        challenge: options.challenge,
    };

    res.json(options);
});


router.post('/verify-registration', async (req,res) => {
    const { body } = req;
    const { name, username,challenge, token } = req.session.pendingRegistration;

    let verification;
    try {
        verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge: challenge,
            expectedOrigin: origin,
            expectedRPID: rpID
        });
    } catch (error) {
        return res.status(400).json({error: error.message});
    }

    const { verified, registrationInfo } = verification;

    if( verified && registrationInfo) {
        const {
            credential,
            credentialDeviceType,
            CredentialBackedUp,
        } = registrationInfo;

    // Create user, store credential, link to new user, mark invite as used
    const userRes = await pool.query('INSERT INTO users(username,display_name) VALUES($1,$2) RETURNING *',[username,name]);
   
    const credRes = await pool.query('INSERT INTO credentials(id,user_id,public_key,counter,credential_type,transports) VALUES($1,$2,$3,$4,$5,$6)',[credential.id,userRes.rows[0].id,Buffer.from(credential.publicKey),credential.counter,credentialDeviceType,body.response.transports]);
    
    const inviteRes = await pool.query('UPDATE invite_tokens SET used_at=$1, used_by_user_id=$2 WHERE token=$3',[new Date(),userRes.rows[0].id, token]);

    }

    res.send({ verified });

});

router.get('/generate-authentication-options', async (req,res) => {

    const { username } = req.query;

    const userReq = await pool.query('SELECT * FROM users WHERE USERNAME=$1', [username]);
    
    if(userReq.rows.length === 0 ) {
        return res.status(400).json({error: 'User not found or invalid credentials'})
    }
   
    const passkeysReq = await pool.query('SELECT * FROM credentials WHERE user_id=$1', [userReq.rows[0].id]);

    if(passkeysReq.rows.length === 0) {
        return res.status(400).json({error: 'User not found or invalid credentials'});
    }

    const options = await generateAuthenticationOptions({
        rp_ID: rpID,
        allowCredentials: passkeysReq.rows.map( passkey => ({
            id:passkey.id,
            type: 'public-key',
            transports: passkey.transports || ['usb', 'nfc', 'ble', 'internal'],
        })),
    });

    req.session.authenticationOptions = {
        username,
        challenge: options.challenge,
    }

    res.json(options);

});

router.post('/verify-authentication', async (req,res) => {

    const { body } = req;
    const {username, challenge} = req.session.authenticationOptions;

    const userReq = await pool.query('SELECT * FROM users WHERE username=$1', [username]);

    if(userReq.rows.length === 0) {
        res.status(404).json({error:'User not found or invalid credentials'});
    }

    const passkeyReq = await pool.query('SELECT * FROM credentials WHERE id=$1 AND user_id=$2',[body.id,userReq.rows[0].id]);

    if(passkeyReq.rows.length === 0) {
        res.status(404).json({error:'User not found or invalid credentials'});
    }

    let verification;
    try {
        verification = await verifyAuthenticationResponse({
            response:body,
            expectedChallenge: challenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            credential: {
                id: passkeyReq.rows[0].id,
                publicKey: passkeyReq.rows[0].public_key,
                counter: passkeyReq.rows[0].counter,
                transports: passkeyReq.rows[0].transports,
            }


        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error});
    }

    const { verified } = verification;

    if(verified) {  
        await pool.query('UPDATE credentials SET counter=$1 WHERE id=$2', [passkeyReq.rows[0].counter+1,passkeyReq.rows[0].id])
    }

    req.session.user = {
        username
    }

    res.send({ verified });

});

module.exports = router;