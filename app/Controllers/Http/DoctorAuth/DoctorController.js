'use strict'

const Doctor = use("App/Models/Doctor")
const Database = use('Database')

class DoctorController {
  async signIn({ request, response, auth }) {
    try {
      const { email, password } = request.all()

      const doctor = await Doctor.findByOrFail('email', email)

      const token = await auth.authenticator('doctor').attempt(email, password)

      return {token, doctor}

    } catch (error) {
      console.log(`${error}`);
      return response.status(error.status).send(error)
    }
  }

  async signUp({ request, response, auth }) {
    const trx = await Database.beginTransaction()
    try {
      const { email, password, ...data } = request.all()
      const doctor = await Doctor.create({ email, password, ...data }, trx)
      await trx.commit()
      return response.status(200).send(doctor)
    } catch (error) {
      await trx.rollback()
      return response.status(error.status).send(error)
    }
  }

  async getUser({ response, params }) {
    try {
      const doctor = await Doctor.query()
        .where('id', params.id)
        .with('clinic')
        .first()
      return response.status(200).send(doctor)
    } catch (error) {
      console.log(error);
      return response.status(error.status).send(error)
    }
  }

  async index({ response }) {
    try {
      const doctors = await Doctor.query()
        .with('clinic')
        .fetch()
      return response.status(200).send(doctors)
    } catch (error) {
      console.log(error);
      return response.status(error.status).send(error)
    }
  }

  async update({ request, params, response }) {
    const trx = await Database.beginTransaction()
    try {
      const doctor = await Doctor.findOrFail(params.id)
      const data = request.all()
      doctor.merge(data)
      await doctor.save(trx)
      await trx.commit()
      return response.status(200).send(doctor)
    } catch (error) {
      await trx.rollback()
      return response.status(error.status).send(error)
    }
  }

  async updateAvailableHours({ request, params, response }) {
    const trx = await Database.beginTransaction()
    try {
      const doctor = await Doctor.findOrFail(params.id)
      const {available_hours} = request.all()

      const available_hours_string = available_hours.join();

      doctor.merge({ available_hours: available_hours_string })
      
      await doctor.save(trx)
      await trx.commit()
      return response.status(200).send(doctor)

    } catch (error) {
      await trx.rollback()
      return response.status(error.status).send(error)
    }
  }

  async destroy({ response, params }) {
    try {
      const doctor = await Doctor.findOrFail(params.id)
      await doctor.delete();
      return response.status(200).send('usuário deletado com sucesso')
    } catch (error) {
      return response.status(error.status).send(error)
    }
  }
}

module.exports = DoctorController
