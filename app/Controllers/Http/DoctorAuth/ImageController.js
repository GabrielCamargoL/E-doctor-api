'use strict'

const Doctor = use("App/Models/Doctor")
const Drive = use('Drive');


class ImageController {
  async uploadProfilePhoto({ response, request, params }) {
    try {
      const doctor = await Doctor.findOrFail(params.id)
      let url
      request.multipart.file('image', {}, async file => {
        const ContentType = file.headers['content-type']
        const name = `${Date.now()}-${file.clientName}`;
        const ACL = 'public-read'
        const Key = `${name}.${file.subtype}`

        const Url = await Drive.put(`tmp/${Key}`, file.stream, {
          ContentType,
          ACL
        })
        url = Url
      })
      await request.multipart.process()
      doctor.path_avatar = url;
      await doctor.save();

      if (url) return response.status(200).send(url)
      else return response.status(500).send('Algo inesperado aconteceu!')
    } catch (err) {
      console.log('Deu ruim nessa caralha', err);
      return response.status(error.status).send(error)
    }
  }
}

module.exports = ImageController
