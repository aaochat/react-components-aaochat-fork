import * as React from "react";
import { useParticipants } from "../hooks";
import { useRoomContext } from "../context";
import Select from "react-select";
// import Close from "../assets/icons/Close";

/** @public */
export interface UserProps extends React.HTMLAttributes<HTMLDivElement> {
    onWaitingRoomChange?: (state: number) => void;
    onMemberButtonClick?: () => void;
    contactsList?: any;
    socket?: any;
    // setWaiting: (state: string) => void;
}

export type UserDataProps = {
    /** The participants to loop over.
     * If not provided, the participants from the current room context are used.
     **/
    participants: any[];
};

export function CallUser({
    socket,
    onWaitingRoomChange,
    onMemberButtonClick,
    contactsList,
    ...props
}: UserProps) {
    const participants = useParticipants(); // List of joined participant
    let [contacts, setContacts] = React.useState<any[]>([]); // List of users in waiting room
    let [allcontacts, setAllContacts] = React.useState<any[]>([]); // List of users in waiting room
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [selectedOption, setSelectedOption] = React.useState("phone");
    const [mobile, setMobile] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [disableButton, setdisableButton] = React.useState(false);
    const room = useRoomContext();
    let CHAT_SERVER_URL = room.metadata ? JSON.parse(room.metadata).app_url : "";
    const [activeTab, setActiveTab] = React.useState("contacts");
    const [invitedUsers, setInvitedUsers] =
        React.useState<string[]>(contactsList);
    const [timeoutIds, setTimeoutIds] = React.useState<number[]>([]);
    const [countries, setCountries] = React.useState([]);
    const [selectedValue, setSelectedValue] = React.useState({
        value: "+1",
        label: "+1",
    });

    React.useEffect(() => {
        fetch(`/country-list.json`).then(async (res) => {
            setCountries(await res.json());
        });
    }, [])

    React.useEffect(() => {
        if (socket) {
            socket.on("meeting:update", (meetingData: any) => {
                // Handle meeting update event

                setInvitedUsers(
                    meetingData.users.filter(
                        (userId: any) =>
                            !meetingData.cancelled_by.includes(userId) &&
                            !meetingData.ended_by.includes(userId)
                    )
                );
                // You can update your component state or perform any other actions here
            });
        }

    }, [socket]);

    const handleChange = (event: any) => {
        setSelectedValue(event);
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        setContacts(allcontacts);
    };
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    const authKey = queryParams.get("authKey");
    const invitedOnCall = queryParams.get("invited");

    async function calling(id: string) {
        const response = await fetch(
            `${CHAT_SERVER_URL}/api/jisti/invite-user-call`,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: authKey ? authKey : "",
                },
                body: JSON.stringify({
                    meeting_id: room.name,
                    invite_user_id: id,
                }),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to fetch data");
        }

        // const data = await response.json();
        setInvitedUsers((prevUsers) => [...prevUsers, id]);
        const timeoutId = setTimeout(() => {
            setInvitedUsers((prevUsers) =>
                prevUsers.filter((userId) => userId !== id)
            );
        }, 30000);
        setTimeoutIds((prevTimeoutIds: any) => [...prevTimeoutIds, timeoutId]);
        // setContacts(data.response.users)
    }
    React.useEffect(() => {
        return () => {
            timeoutIds.forEach((timeoutId: any) => clearTimeout(timeoutId));
        };
    }, []);

    async function usersList2() {
        const response = await fetch(`${CHAT_SERVER_URL}/api/user/all-contact`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: authKey ? authKey : "",
                token: token ? token : "",
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        const originalContacts = [...data.response.users];

        // Sort the contacts alphabetically by name
        const sortedContacts = originalContacts.sort((a, b) => {
            // Convert names to lowercase to ensure case-insensitive sorting
            const nameA = a.full_name.toLowerCase();
            const nameB = b.full_name.toLowerCase();

            // Compare the names
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        setContacts(sortedContacts);
        setAllContacts(sortedContacts);
    }
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const searchTerm = (inputRef.current?.value || "").toLowerCase().trim();

        if (searchTerm) {
            const filteredContacts = allcontacts.filter((item: any) => {
                const userMatch = item.user_name.toLowerCase().includes(searchTerm);
                const fullNameMatch = item.full_name.toLowerCase().includes(searchTerm);

                // Return true if either user_name or full_name matches the search term
                return userMatch || fullNameMatch;
            });

            setContacts(filteredContacts);
        } else {
            // If search term is empty, reset to the original list
            setContacts(allcontacts);
        }
    };

    React.useEffect(() => {
        usersList2();
    }, [CHAT_SERVER_URL]);

    const ulRef = React.useRef<HTMLUListElement>(null);
    const ulRef2 = React.useRef<HTMLUListElement>(null);

    const handleKeyPress = (event: any) => {
        const keyCode = event.keyCode || event.which;

        // Allow only digits (0-9)
        if (!/^\d+$/.test(event.key) && ![37, 38, 39, 40, 8].includes(keyCode)) {
            event.preventDefault();
        }
    };

    const filteredContacts = contacts.filter((contact) => {
        // Check if the contact's user_id is not present in participants
        const isInParticipants = participants.some(
            (participant: any) =>
                participant.identity === contact.user_id ||
                (participant.participantInfo &&
                    participant.participantInfo.identity === contact.user_id)
        );

        return !isInParticipants;
    });
    const ParticipatedContacts = participants.map((participant: any) => {
        const matchingContact = contacts.find(
            (contact) => contact.user_id === participant.participantInfo.identity
        );

        if (matchingContact) {
            // Return both participant and contact details if a match is found
            return {
                ...matchingContact,
                full_name: matchingContact
                    ? matchingContact.full_name
                    : participant.participantInfo.name,
            };
        } else {
            // Return only participant details if no match is found
            return {
                ...matchingContact,
                full_name: matchingContact
                    ? matchingContact.full_name
                    : participant.participantInfo.name,
            };
        }
    });
    const searchTerm = (inputRef.current?.value || "").toLowerCase().trim();
    const filteredParticipants = searchTerm
        ? ParticipatedContacts.filter(
            (item) =>
                item.full_name.toLowerCase().includes(searchTerm) ||
                (item.designation &&
                    item.designation.toLowerCase().includes(searchTerm))
        )
        : ParticipatedContacts;

    const sendInvite = async (e: any) => {
        e.preventDefault();
        setdisableButton(true);
        let roomName = room?.name;
        if (
            (selectedOption === "phone" && selectedValue.value && mobile) ||
            (selectedOption === "email" && email && roomName)
        ) {
            const response = await fetch(
                `${CHAT_SERVER_URL}/api/jisti/invite-by-phone-email`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: authKey ? authKey : "",
                        token: token ? token : "",
                    },
                    body: JSON.stringify({
                        meeting_id: roomName,
                        [selectedOption === "phone" ? "phone_no" : "email"]:
                            selectedOption === "phone"
                                ? String(selectedValue.value) + String(mobile)
                                : email,
                    }),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to invite");
            } else {
                setdisableButton(false);
                setMobile("");
                setSelectedValue({
                    value: "",
                    label: "",
                });
                setEmail("");
                const jsonResponse = await response.json();
                alert(jsonResponse.message);
            }
        }
    };

    const customStyles = {
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
        }),
    };
    const renderInputField = () => {
        if (selectedOption === "phone") {
            return (
                <>
                    <div style={{ minWidth: "100px" }}>
                        <Select
                            value={selectedValue}
                            onChange={handleChange}
                            options={countries.map((country: { name: string, dial_code: string; }) => ({
                                value: country.dial_code,
                                label: `${country.dial_code}`,
                            }))}
                            styles={customStyles}
                            placeholder="Select your country"
                        />
                    </div>
                    <input
                        className="lk-form-control lk-chat-form-input"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        type="text"
                        placeholder="Mobile No"
                        onKeyDown={handleKeyPress}
                        maxLength={10}
                    />
                </>
            );
        } else if (selectedOption === "email") {
            return (
                <input
                    className="lk-form-control lk-chat-form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="Email Address"
                />
            );
        }
    };

    const handleRadioChange = (option: string) => {
        setSelectedOption(option);
    };
    const isValidEmail = (email: String) => {
        // Basic email validation
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };
    return (
        <div
            {...props}
            className="lk-chat lk-users"
        >
            <div style={{ height: "-webkit-fill-available" }}>
                <div style={{ position: "relative" }}>
                    <div style={{ position: "sticky", top: 0, zIndex: 1 }}>
                        <div
                            className="tl-invite-buttons"
                        >
                            <button
                                type="button"
                                className="lk-button lk-chat-form-button"
                                aria-pressed={activeTab === 'callParticipants'}
                                onClick={() => handleTabChange("callParticipants")}
                            >
                                Participants
                            </button>

                            {!invitedOnCall &&
                                (
                                    <button
                                        type="button"
                                        className="lk-button lk-chat-form-button"
                                        aria-pressed={activeTab === 'contacts'}
                                        onClick={() => handleTabChange("contacts")}
                                    >
                                        Contacts
                                    </button>
                                )}

                            <button
                                type="button"
                                className="lk-button lk-chat-form-button"
                                aria-pressed={activeTab === 'invite'}
                                onClick={() => handleTabChange("invite")}
                            >
                                Invite
                            </button>
                        </div>

                        {activeTab != "invite" && (
                            <form
                                className="lk-chat-form"
                                onSubmit={(e) => e.preventDefault()}
                            >
                                <input
                                    className="lk-form-control lk-chat-form-input"
                                    ref={inputRef}
                                    onChange={handleSearch}
                                    type="text"
                                    placeholder="Search..."
                                />
                            </form>
                        )}

                        {activeTab === "invite" && (
                            <>
                                <form>
                                    <div className="lk-chat-form">
                                        Invitation type:
                                        <div>
                                            <input
                                                type="radio"
                                                id="phone"
                                                name="contactOption"
                                                value="phone"
                                                style={{ cursor: "pointer" }}
                                                checked={selectedOption === "phone"}
                                                onChange={() => handleRadioChange("phone")}
                                            />
                                            <label
                                                style={{ cursor: "pointer", marginLeft: "5px" }}
                                                htmlFor="phone"
                                            >
                                                Phone
                                            </label>
                                        </div>
                                        <div>
                                            <input
                                                type="radio"
                                                id="email"
                                                style={{ cursor: "pointer" }}
                                                name="contactOption"
                                                value="email"
                                                checked={selectedOption === "email"}
                                                onChange={() => handleRadioChange("email")}
                                            />
                                            <label
                                                style={{ cursor: "pointer", marginLeft: "5px" }}
                                                htmlFor="email"
                                            >
                                                Email
                                            </label>
                                        </div>
                                    </div>

                                    <div className="lk-chat-form">
                                        {renderInputField()}
                                        <button
                                            disabled={
                                                !(
                                                    (selectedOption === "phone" &&
                                                        mobile &&
                                                        selectedValue.value) ||
                                                    (selectedOption === "email" &&
                                                        isValidEmail(email) &&
                                                        email)
                                                ) || disableButton
                                            }
                                            className={`lk-button lk-success`}
                                            style={{
                                                marginRight: "13px",
                                                marginBottom: "3px",
                                                cursor: "pointer",
                                                float: "right",
                                            }}
                                            onClick={sendInvite}
                                        >
                                            Invite
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>

                {activeTab == "contacts" &&
                    <ul style={{ height: "77vh", overflow: "scroll", display: "block" }} className="lk-list lk-chat-messages" ref={ulRef}>
                        {filteredContacts.map((user, index) => {
                            return (
                                <li key={index} className="lk-chat-entry">
                                    <div style={{ width: "100%" }}>
                                        <span className="lk-message-body text-ellipsis">{user.full_name}</span>
                                        <span className="lk-message-body lk-message-text text-ellipsis">{user.designation}</span>

                                        <button
                                            disabled={invitedUsers.includes(user.user_id)}
                                            className={`lk-button   ${invitedUsers.includes(user.user_id) ? "lk-secondary" : "lk-success"}`}
                                            style={{
                                                marginRight: "3px",
                                                marginBottom: "3px",
                                                cursor: `${invitedUsers.includes(user.user_id) ? "inherit" : "pointer"}`,
                                            }}
                                            onClick={() => calling(user.user_id)}
                                        >
                                            {invitedUsers.includes(user.user_id) ? "Invited" : "Call"}
                                        </button>
                                    </div>

                                    {/* <button type="button" onClick={() => handleInvite(user)} className={"lk-button lk-chat-form-button" + (user.invited ? ' invited' : '')}>
                                            {user.invited ? 'Invited' : 'Invite'}
                                        </button> */}
                                </li>
                            )
                        })}
                    </ul>
                }
                {activeTab == "callParticipants" &&
                    <ul style={{ height: "77vh", overflow: "scroll", display: "block" }} className="lk-list lk-chat-messages" ref={ulRef2}>
                        {filteredParticipants.map((user, index) => {
                            return (
                                <li key={index} className="lk-chat-entry">
                                    <div>
                                        <span className="lk-message-body text-ellipsis">{user.full_name} {room.localParticipant.identity == user.user_id
                                            ? " (me)"
                                            : ""}</span>
                                        <span className="lk-message-body lk-message-text text-ellipsis">{user.designation ? user.designation : "-"}</span>

                                        <div>&nbsp;</div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                }
            </div>
        </div>
    );
}
