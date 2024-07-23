import * as React from "react";
import { Toast } from "../components";
import { InviteViaPhoneEmailProps } from "./InviteViaPhone";

export function InviteViaEmail({ link, room_name, participant, isCallScreen, ...props }: InviteViaPhoneEmailProps) {
    const [showToast, setShowToast] = React.useState<boolean | string>(false);
    const [email, setEmail] = React.useState("");

    function setEmpty() {
        if (email) {
            setEmail("");
        }
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (email && email.trim() !== '') {
            let sentMail = email;
            setEmpty();
            setShowToast(sentMail);
            if (isCallScreen) {
                const queryParams = new URLSearchParams(window.location.search);
                const token = queryParams.get("token");
                const authKey = queryParams.get("authKey");

                const data = {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "email": sentMail, // body data type must match "Content-Type" header
                        "token": token,
                        "authkey": authKey,
                        "meeting_id": room_name,
                    })
                };
                fetch(`/api/invite-call-email-phone`, data).then(async (res) => {
                    if (res.ok) {

                    } else {
                        throw Error('Error fetching server url, check server logs');
                    }
                });
            } else {
                const data = {
                    method: "POST", // *GET, POST, PUT, DELETE, etc.
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "email": sentMail, // body data type must match "Content-Type" header
                        "link": link,
                        "meeting_id": room_name,
                        "participant": participant,
                    })
                };

                fetch(`/api/invite-email`, data).then(async (res) => {
                    if (res.ok) {
                        // setShowToast(true);
                    } else {
                        throw Error('Error fetching server url, check server logs');
                    }
                });
            }
        }
    }

    React.useEffect(() => {
        if (showToast) {
            setTimeout(() => {
                setShowToast(false);
            }, 3000)
        }
    }, [showToast]);

    return (
        <div {...props}>
            {showToast ? <Toast className="lk-toast-connection-state">Invitation sent successfully to {showToast}.</Toast> : <></>}
            <form className="lk-chat-form" onSubmit={handleSubmit}>
                <input className="lk-form-control lk-chat-form-input" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email" />

                <button type="submit" className="lk-button lk-chat-form-button tl-invite-button">
                    Invite
                </button>
            </form>
        </div>
    );
}