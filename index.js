const express = require('express')
const app = express();
const morgan = require('morgan')
const cors = require('cors')

let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
      },
      { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
      },
      { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
]

morgan.token('req-body', (req) => JSON.stringify(req.body));

app.use(cors());

app.use(express.json())

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'));

app.get('/api/persons', (req, res) => {
    res.status(200).json(persons);
})

app.get('/info', (req, res) => {
    const date = new Date();

    res.send(`
    <div>
        <p>Phonebook has info for ${persons.length} people</p>
        <br/>
        <p>${date}</p>
    </div>
    `)
})

app.get('/api/persons/:id', (req, res) => {
    const { id } = req.params
    const matchingPerson = persons.find(p => p.id === parseInt(id))

    if (matchingPerson) {
        return res.status(200).json(matchingPerson);
    } else {
        return res.status(404).end
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const { id } = req.params
    persons = persons.filter(p => p.id !== parseInt(id));

    return res.status(204).end
})

app.post('/api/persons', (req, res) => {
    const randomNumber = Math.floor(Math.random() * 100001);

    const body = req.body;

    if (!body || !body.name || !body.number) {
        return res.status(400).json({
            error: 'Content missing'
        })
    } else {
        if (persons.some(person => person.name === body.name)) {
            return res.status(400).json({
                error: 'name must be unique'
            })
        }

        let newPerson = {
            id: randomNumber,
            name: body.name,
            number: body.number.toString()
        }

        persons = persons.concat(newPerson)
        return res.status(201).json(newPerson)
    }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})