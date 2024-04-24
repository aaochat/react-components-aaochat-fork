import * as React from "react";
import { Toast } from "../components";

/**
 * InviteViaPhoneProps
 * @interface InviteViaPhoneProps
 * @property {string} link - The link to the room
 * @property {string} room_name - The name of the room
 */
export interface InviteViaPhoneEmailProps {
    link: string;
    room_name: string;
    participant: string | undefined;
};

export function InviteViaPhone({ link, room_name, participant, ...props }: InviteViaPhoneEmailProps) {
    const selectRef = React.useRef<HTMLSelectElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [showToast, setShowToast] = React.useState<boolean>(false);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (inputRef.current && inputRef.current.value.trim() !== '') {
            const number = selectRef.current?.value + inputRef.current.value;
            const data = {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "number": number, // body data type must match "Content-Type" header
                    "link": link,
                    "meeting_id": room_name,
                    "participant": participant,
                })
            };

            fetch(`/api/invite-phone`, data).then(async (res) => {
                if (res.ok) {
                    setShowToast(true);
                } else {
                    throw Error('Error fetching server url, check server logs');
                }
            });
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
            {showToast ? <Toast className="lk-toast-connection-state">Invitation Sent</Toast> : <></>}
            <form className="lk-chat-form" onSubmit={handleSubmit}>
                <select className="lk-form-control lk-chat-form-input tl-select" ref={selectRef}>
                    <option value="+1">United States (+1)</option>
                    <option value="+91">India (+91)</option>
                </select>

                <input className="lk-form-control lk-chat-form-input" type="tel" ref={inputRef} placeholder="Enter Mobile Number" />

                <button type="button" onClick={handleSubmit} className="lk-button lk-chat-form-button tl-invite-button">
                    Invite
                </button>
            </form>
        </div>
    );
}