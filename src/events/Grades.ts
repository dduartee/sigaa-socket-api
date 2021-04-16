import { CourseStudent, StudentBond } from 'sigaa-api';
import { GradeGroup } from 'sigaa-api/dist/courses/resources/sigaa-grades-student';
import { Socket } from 'socket.io';
import Courses from './Courses';
import Bonds from './Bonds';
import { IsocketEvent } from '../abstracts/socketEvent';
import socketCache from '../models/socketCache';
export default class Grades implements IsocketEvent {
    activeBonds: any;
    rawCourses: any;
    /**
     * Lista todas as notas
     * @param client Socket
     * @returns 
     */
    async list(client: Socket, cache: socketCache) {
        try {
            const ref = cache.get(client.id)
            const {activeBonds, rawCourses} = cache.get(ref.token)
            this.activeBonds = activeBonds;
            this.rawCourses = rawCourses

            const bondsJSON = [];
            for (const [pos, bond] of (this.activeBonds).entries()) {
                const coursesJSON = []
                for (const courses of this.rawCourses[pos]) for (const course of courses) {
                    const gradeGroups = await course.getGrades();
                    const gradesJSON = Grades.parse(gradeGroups);
                    coursesJSON.push(Courses.parse({course, gradesJSON}));
                    client.emit('jsonData', JSON.stringify({ bonds: Bonds.parse({bond, coursesJSON}) }))
                }
                bondsJSON.push(Bonds.parse({bond, coursesJSON}))
                return client.emit('jsonData', JSON.stringify({ bonds: bondsJSON }))
            }
        } catch (error) {
            console.error(error);
            client.emit('status', "Não foi possivel listar as notas...")
            return client.emit('errors', error)
        }
    }
    async specific(code: string, client: Socket, cache: socketCache) {
        try {
            const ref = cache.get(client.id)
            const {activeBonds, rawCourses} = cache.get(ref.token)
            this.activeBonds = activeBonds;
            this.rawCourses = rawCourses

            const bondsJSON = [];
            for (const [pos, bond] of (this.activeBonds).entries()) {
                const coursesJSON = []
                for (const courses of this.rawCourses[pos]) for (const course of courses) {
                    console.log(course.code)
                    if(code == course.code) {
                        const gradeGroups = await course.getGrades();
                        const gradesJSON = Grades.parse(gradeGroups);
                        coursesJSON.push(Courses.parse({course, gradesJSON}));
                        client.emit('jsonData', JSON.stringify({ bonds: Bonds.parse({bond, coursesJSON}) }))
                    }
                }
                bondsJSON.push(Bonds.parse({bond, coursesJSON}))
                return client.emit('jsonData', JSON.stringify({ bonds: bondsJSON }))
            }
        } catch (error) {
            console.error(error);
            client.emit('status', "Não foi possivel listar as notas...")
            return client.emit('errors', error)
        }
    }
    /**
     * Retorna as notas em JSON
     * @param gradesGroups Gradegroup
     * @returns 
     */
    static parse(gradesGroups: GradeGroup[]) {
        const gradeJSON = [];
        const personalGrade = [];

        for (const gradesGroup of gradesGroups) {
            switch (gradesGroup.type) {
                case "only-average":
                    gradeJSON.push({
                        name: gradesGroup.name,
                        value: gradesGroup.value,
                    });
                    break;
                case "weighted-average":
                    for (const grade of gradesGroup.grades) {
                        personalGrade.push({
                            name: grade.name,
                            weight: grade.weight,
                            value: grade.value,
                        });
                    }
                    gradeJSON.push({
                        personalGrade,
                        groupGrade: gradesGroup.value,
                    });
                    break;
                case "sum-of-grades":
                    for (const grade of gradesGroup.grades) {
                        personalGrade.push({
                            name: grade.name,
                            maxValue: grade.maxValue,
                            value: grade.value,
                        });
                    }
                    gradeJSON.push({
                        personalGrade,
                        groupGrade: gradesGroup.value,
                    });
                    break;
            }
        }
        return gradeJSON;
    }
};
