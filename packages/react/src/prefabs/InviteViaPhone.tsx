import * as React from "react";
import { Toast } from "../components";
import Select from 'react-select';

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
    isCallScreen: boolean;
    style?: React.CSSProperties;
};

export function InviteViaPhone({ link, room_name, participant, isCallScreen, style, ...props }: InviteViaPhoneEmailProps) {
    // const selectRef = React.useRef<HTMLSelectElement>(null);
    // const [defaultValue, setDefaultValue] = React.useState<string>('+1');
    const [mobile, setMobile] = React.useState("");
    const [showToast, setShowToast] = React.useState<boolean | string>(false);
    const [countries, setCountries] = React.useState([]);

    React.useEffect(() => {
        fetch(`/country-list.json`).then(async (res) => {
            setCountries(await res.json());
        });
    }, [])

    function setEmpty() {
        if (mobile) {
            setMobile("");
            setSelectedValue({
                value: "+1",
                label: "+1",
            });
        }
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (mobile && mobile.trim() !== '') {
            const number = selectedValue.value + mobile;

            setEmpty();
            setShowToast(number);
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
                        "number": number, // body data type must match "Content-Type" header
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
                    method: "POST",
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

    const [selectedValue, setSelectedValue] = React.useState({
        value: "+1",
        label: "+1",
    });

    const handleChange = (selectedCountry: any) => {
        setSelectedValue({
            value: selectedCountry.value,
            label: selectedCountry.value,
        });
    };

    const customStyles = {
        container: (provided: any) => ({
            ...provided,
            width: "100%",
        }),
        control: (provided: any) => ({
            ...provided,
            backgroundColor: "#2b2b2b",
            borderColor: "hsl(0deg 0% 11.76%)",
            color: "white",
        }),

        singleValue: (provided: any) => ({
            ...provided,
            color: "white",
        }),
        option: (provided: any) => ({
            ...provided,
            color: "black",
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: "white",
            width: "130px",
        }),
        menuList: (base: any) => ({
            ...base,
            // height: "100px",

            "::-webkit-scrollbar": {
                width: "5px"
            },
            "::-webkit-scrollbar-track": {
                background: "#000"
            },
            "::-webkit-scrollbar-thumb": {
                background: "#888"
            },
            "::-webkit-scrollbar-thumb:hover": {
                background: "#555"
            }
        })
    };

    return (
        <div style={style} {...props}>
            {showToast ? <Toast className="lk-toast-connection-state">Invitation sent successfully to {showToast}.</Toast> : <></>}
            <form className="lk-chat-form" style={{ display: "flex", alignItems: "center" }} onSubmit={handleSubmit}>
                <div style={{ minWidth: "100px", maxWidth: "150px" }}>
                    <Select
                        value={selectedValue}
                        onChange={handleChange}
                        options={countries.map((country: {
                            name: string, dial_code: string; code: string;
                        }) => ({
                            value: country.dial_code,
                            label: `${country.dial_code} - ${country.code}`,
                        }))}
                        styles={customStyles}
                        placeholder="Select your country"
                    />
                </div>

                <input className="lk-form-control lk-chat-form-input" type="tel" onChange={(e) => setMobile(e.target.value)} placeholder="Enter Mobile Number" pattern="[0-9]+" title="Enter valid mobile number" maxLength={10} minLength={10} value={mobile} />

                <button type="submit" className="lk-button lk-chat-form-button tl-invite-button">
                    Invite
                </button>
            </form>
        </div>
    );
}