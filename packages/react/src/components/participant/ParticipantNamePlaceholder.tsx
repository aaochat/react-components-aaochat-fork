import * as React from 'react';
export const ParticipantNamePlaceholder = (props: any) => {
  const [image, setImage] = React.useState<boolean>(false);

  return (
    <div>
      {props.name && (
        <img
          style={image ? {} : { display: 'none' }}
          src={`https://ui-avatars.com/api/?name=${props.name}&rounded=true&size=250&background=565656&bold=true`}
          alt={`${props.name} profile image`}
          onLoad={() => setImage(true)}
        />
      )}
    </div>
  );
};
