# Provenance Viewer

The provenance screen ties every synthetic artifact back to its provider, prompt, and audit trail so that operators and auditors can understand how a short-form asset was created and verified.

## Provider + prompt traces

- Each provider trace card lists the model, operator, collection of source/generated assets, and request/response metadata.
- Prompt artifacts include token counts and confidence scores so operators can justify why a specific instruction was used.

## Asset / audit spotlight

- Source and generated assets show filesystem paths plus checksum values that will later map to control-plane manifests.
- Audit events chronicle ingest, review, and publish flags so nothing is hidden.

## Export bundle

- The manifest viewer presents the bundle path, checksum, and disclosure metadata that will accompany the bundle handed to the control plane.
- Review trail entries demonstrate which approvals have already been granted, aligning with the control-plane review decisions.

No cryptographic claims are made—the UI simply surfaces the recorded checksums and disclosure strings already emitted by the backend.
