# Setup instructions:
In your env, set 

TODO: 
- Automate exporting documentation (fix broken mermaid graph) ? (unless github makes it work fine)
- Swap language variable to be for each member, instead of site-wide (or allow overrides per-member)
- Make landing page dynamic (use names/images from config)

Notes:
- The FIRST member in the members is intended to be the person (alert-or) themselves. This is due to the following two implications:
1. They will receive a modified message asking them to confirm or cancel the alert
2. Their name will be used dynamically in follow-up messages.



# Pager programming notes:
TMF Numeric commands:
001 - Button Pushed

002 - Fall Detected

003 - Low Battery

GPJ Numeric commands:
011 - Button Pushed

012 - Fall Detected

013 - Low Battery

Send M2M sms to 2936