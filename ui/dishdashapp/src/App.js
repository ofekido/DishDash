import React, { Component } from 'react';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            questions: [],
            currentQuestionIndex: 0,
            answers: [],
            completed: false,
        };
    }

    componentDidMount() {
        this.fetchQuestions();
    }

    fetchQuestions() {
        fetch('http://localhost:5038/api/DishDash/GetQuestions')
            .then(response => response.json())
            .then(questions => {
                this.setState({ questions });
            })
            .catch(error => {
                console.error('Error fetching questions:', error);
            });
    }

    handleNameChange = event => {
        this.setState({ name: event.target.value });
    };

    handleAnswerChange = event => {
        const { currentQuestionIndex, answers } = this.state;
        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestionIndex] = event.target.value;
        this.setState({ answers: updatedAnswers });
    };

    handleNextQuestion = () => {
        const { currentQuestionIndex, answers } = this.state;
        if (currentQuestionIndex < 6) { // Adjusted to stop after the 7th question
            this.setState(prevState => ({
                currentQuestionIndex: prevState.currentQuestionIndex + 1,
            }));
            this.saveDataToMongoDB(currentQuestionIndex); // Save data to MongoDB on next question
        } else {
            // If all questions are answered, set completed to true
            this.setState({ completed: true });
            this.saveDataToMongoDB(currentQuestionIndex); // Save the last answer to MongoDB
        }
    };

    saveDataToMongoDB = (currentQuestionIndex) => {
        const { name, questions, answers } = this.state;
        const dataToUpdate = {
            userId: name,
            questionText: questions[currentQuestionIndex].questionText,
            responseText: answers[currentQuestionIndex],
            questionId: questions[currentQuestionIndex]._id,
            createdAt: new Date().toISOString()
        };

        fetch('http://localhost:5038/api/saveResponseToMongoDB', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToUpdate),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Data updated in MongoDB:', data);
        })
        .catch(error => {
            console.error('Error updating data in MongoDB:', error);
        });
    };

    handleRestart = () => {
        // Reset the state to restart the questionnaire
        this.setState({
            name: '',
            answers: [],
            currentQuestionIndex: 0,
            completed: false,
        });
    };

    render() {
        const { name, questions, currentQuestionIndex, answers, completed } = this.state;
        const currentQuestion = questions[currentQuestionIndex];

        return (
            <div className="App">
                <div className="top-bar">
                    <img src="/images/dishdash.jpeg" alt="DishDash Logo" className="logo" />
                    <h1 className="title">DishDash</h1>
                </div>
                {completed ? (
                    <div>
                        <h3>Thank you for answering the questions, {name}!</h3>
                        <button onClick={this.handleRestart}>Restart</button>
                    </div>
                ) : currentQuestionIndex === 0 ? (
                    <div>
                        <h2>Welcome to DishDash!</h2>
                        <p>In order to help you better, please enter your name:</p>
                        <input
                            type="text"
                            value={name}
                            onChange={this.handleNameChange}
                            placeholder="Enter your name"
                        />
                        <button onClick={this.handleNextQuestion}>Proceed</button>
                    </div>
                ) : (
                    <div>
                        <h3>{currentQuestion.questionText}</h3>
                        <input
                            type="text"
                            value={answers[currentQuestionIndex] || ''}
                            onChange={this.handleAnswerChange}
                            placeholder="Your answer"
                        />
                        <button onClick={this.handleNextQuestion}>Next</button>
                    </div>
                )}
            </div>
        );
    }
}

export default App;
