import { Account, CourseStudent, StudentBond } from 'sigaa-api';
import { Socket } from 'socket.io';
import socketCache from '../models/socketCache';
import { IsocketEvent } from '../abstracts/socketEvent';
import Bonds from './Bonds';
export default class Courses implements IsocketEvent{
    rawCourses = [] // armazena as materias em ordem dos vinculos
    activeBonds: StudentBond[]
    /**
     * Lista todos as matérias
     * @param client :Socket
     * @returns 
     */
    async list(client: Socket, cache: socketCache) {
        try {
            const ref = cache.get(client.id);
            const {activeBonds} = cache.get(ref.token)
            this.activeBonds = activeBonds; //resgata os bonds

            const bondsJSON = [];
            for (const [pos, bond] of (this.activeBonds).entries()) {
                const courses: CourseStudent[] = await bond.getCourses();
                this.rawCourses[pos] = []
                this.rawCourses[pos].push(courses)
                
                const coursesJSON = [];
                for (const courses of this.rawCourses[pos]) for (const course of courses) {
                    coursesJSON.push(Courses.parse({course}))
                    client.emit('jsonData', JSON.stringify({ bonds: Bonds.parse({bond, coursesJSON}) }))
                }
                bondsJSON.push(Bonds.parse({bond, coursesJSON}))
                client.emit('jsonData', JSON.stringify({ bonds: bondsJSON }))
                cache.append(ref.token, {rawCourses: this.rawCourses});
                return;
            }
        } catch (error) {
            console.error(error);
            client.emit('status', "Não foi possivel listar as matérias...")
            return client.emit('errors', error)
        }
    }
    /**
     * 
     * @param course CourseStudent
     * @param gradesJSON 
     * @param homeworksJSON 
     * @param newsJSON 
     * @returns {id, title, code, period, schedule, grades, homeworks, news}
     */
    static parse(data: {course: CourseStudent, gradesJSON?, homeworksJSON?, newsJSON?}) {
        return ({
            id: data.course.id,
            title: data.course.title,
            code: data.course.code,
            period: data.course.period,
            schedule: data.course.schedule,
            grades: data.gradesJSON,
            homeworks: data.homeworksJSON,
            news: data.newsJSON
        })
    }
};
