from fastapi_mail import FastMail, MessageSchema


async def send_alert(email, url):

    message = MessageSchema(
        subject="HOME Alert 🚨",
        recipients=[email],
        body=f"{url} is DOWN",
        subtype="html"
    )

    fm = FastMail(conf)

    await fm.send_message(message)