import {
  loadPeople,
  savePeople,
  type WorkspacePerson,
} from "@/lib/workspaces";
import type {
  PeopleRepository,
} from "@/lib/repositories/types";

export class LocalPeopleRepository
  implements PeopleRepository
{
  async list(): Promise<
    WorkspacePerson[]
  > {
    return loadPeople();
  }

  async save(
    people: WorkspacePerson[],
  ): Promise<void> {
    savePeople(people);
  }
}
