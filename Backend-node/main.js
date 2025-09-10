

try {
        const res = await fetch(`http://localhost:5000/documents/bf428b8f-ed00-4190-a59c-11c9d9ac86d8`);
        console.log("payload: ", res);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const doc = await res.json();
        setDisplayDoc(doc);
      } catch (err) {
        console.error("Error while trying to display the document: ", err);
      }

