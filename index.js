require('dotenv').config()
const express = require('express')
const app = express();
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

morgan.token('req-body', (req) => JSON.stringify(req.body));

app.use(cors());

app.use(express.json())

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'));

app.get('/api/persons', (req, res) => {
    Person.find({}).then(people => {
        console.log(people)
        res.json(people)
    })
})

app.get('/info', (req, res) => {
    const date = new Date();
    let numberOfPeople

    Person.find({}).then(people => {
        numberOfPeople = people.length
    })

    res.send(`
    <div>
        <p>Phonebook has info for ${numberOfPeople} people</p>
        <br/>
        <p>${date}</p>
    </div>
    `)
})

app.get('/api/persons/:id', (req, res, next) => {
    const { id } = req.params

    Person.findById(id)
        .then(person => {
            return res.status(200).json(person);
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then(result => {
            if (result) {
                res.status(204).end();
            } else {
                res.status(400).json({ error: 'Person was already deleted from the database' });
            }
        })
        .catch(error => next(error));
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body;

    if (!body || !body.name || !body.number) {
        return res.status(400).json({
            error: 'Content missing'
        });
    } else {
        Person.findOne({ name: body.name })
            .then(existingPerson => {
                if (existingPerson) {
                    return res.status(400).json({
                        error: 'name must be unique'
                    });
                } else {
                    const person = new Person({
                        name: body.name,
                        number: body.number.toString()
                    });

                    return person.save();
                }
            })
            .then(savedPerson => {
                if (savedPerson) {
                    res.json(savedPerson);
                }
            })
            .catch(error => next(error));
    }
});

app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body
  
    Person.findByIdAndUpdate(req.params.id, 
        { name, number },
        { new: true, runValidators: true, context: 'query' }
      )
      .then(updatedPerson => {
        res.json(updatedPerson)
      })
      .catch(error => next(error))
  })

const errorHandler = (error, req, res, next) => {
    if (error.name === 'CastError') {
      return res.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    }
  
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})