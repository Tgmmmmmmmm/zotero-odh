function ODHNote(props: { services: string; nindex: number; note: any }) {
  const services = props.services;
  const nindex = props.nindex;
  const note = props.note;
  let content = "";
  //   const services = this.options ? this.options.services : "";
  let image = "";
  let imageclass = "";
  if (services != "none") {
    image = services == "ankiconnect" ? "plus.png" : "cloud.png";
    imageclass = (await isConnected())
      ? 'class="odh-addnote"'
      : 'class="odh-addnote-disabled"';
  }

  for (const [nindex, note] of notes.entries()) {
    content += note.css + '<div class="odh-note">';
    let audiosegment = "";
    if (note.audios) {
      for (const [dindex, audio] of note.audios.entries()) {
        if (audio)
          audiosegment += `<img class="odh-playaudio" data-nindex="${nindex}" data-dindex="${dindex}" src="${
            rootURI + "fg/img/play.png"
          }"/>`;
      }
    }
  }

  return (
    <div className="odh-note">
      <div className="odh-headsection">
        <span className="odh-audios">
          {note.audios.map((dindex: number, audio: any) => {
            audio && (
              <img
                className="odh-playaudio"
                data-nindex={`${nindex}`}
                data-dindex={`${dindex}`}
                src="{rootURI + fg/img/play.png}"
              />
            );
          })}
        </span>
        <span className="odh-expression">{note.expression}</span>
        <span className="odh-reading">{note.reading}</span>
        <span className="odh-extra">{note.extrainfo}</span>
      </div>
      {note.definitaions.map()}
      <div className="odh-definition">
        {button}
        {definition}
      </div>
    </div>
  );
}

export default ODHNote;
